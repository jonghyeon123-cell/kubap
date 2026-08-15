#!/usr/bin/env node
/**
 * 고려대학교 공식 페이지에서 주간 식단을 받아 data/dining-halls.json을 다시 만든다.
 *
 *   node scripts/fetch-menus.mjs            # 이번 주
 *   node scripts/fetch-menus.mjs --next     # 다음 주
 *   node scripts/fetch-menus.mjs --monday 2026.08.24
 *
 * 식당 메타데이터(운영시간·전화·위치)는 scripts/halls.config.mjs에서 손으로 관리하고,
 * 이 스크립트는 메뉴 내용만 갱신한다.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import * as cheerio from 'cheerio';

import { CAMPUSES, HALLS, MEALS, WEEKDAYS } from './halls.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'dining-halls.json');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const DAY_BY_INDEX = [null, 'mon', 'tue', 'wed', 'thu', 'fri', null];

/** 학교 서버가 종종 연결을 늦게 받아서, 짧게 물러났다가 다시 시도한다. */
async function fetchWithRetry(url, init = {}, attempts = 3) {
  let lastError;

  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { 'User-Agent': UA, ...(init.headers ?? {}) },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }

  throw lastError;
}

/** 사이트가 쓰는 layout 토큰은 `${siteId}@@${menuSeq}@@fnct1`의 hex 인코딩이다. */
function layoutToken(siteId, menuSeq) {
  return Buffer.from(`${siteId}@@${menuSeq}@@fnct1`, 'utf8').toString('hex');
}

/** 주어진 날짜가 속한 주의 월요일을 "YYYY.MM.DD"로. */
function mondayOf(date) {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** 식단구분 라벨을 앱의 끼니 슬롯으로 매핑. 매칭 안 되면 버린다. */
function mealSlotOf(category) {
  if (/조식|아침/.test(category)) return 'breakfast';
  if (/석식|저녁/.test(category)) return 'dinner';
  if (/중식|점심/.test(category)) return 'lunch';
  return null;
}

const NO_MENU = /등록된 식단내용이\(가\) 없습니다|미운영|운영하지 않|휴무|대체휴일|대체공휴일/;

/** "(우육:호주산)"처럼 원산지만 담은 줄은 메뉴가 아니다. */
const ORIGIN_ONLY = /^\((?:[^()]*[:：][^()]*)?[^()]*(?:산|産)\)$/;

/** "[학생식당]"처럼 구역을 나누는 머리표. */
const SECTION_MARK = /^\[(.+)\]$/;

/** "돈까스김치찌개<br>흑미밥<br>₩6,000" → { items, price } */
function parseMenuCell(html) {
  const withBreaks = cheerio
    .load(`<div>${html}</div>`)('div')
    .html()
    .replace(/<br\s*\/?>/gi, '\n');
  const flat = cheerio.load(`<div>${withBreaks}</div>`)('div').text();

  let price = null;
  const items = [];

  for (const raw of flat.split('\n')) {
    const line = raw.replace(/\s+/g, ' ').trim();
    if (!line) continue;
    if (ORIGIN_ONLY.test(line)) continue;

    const money = line.match(/₩\s*([\d,]+)/);
    if (money) {
      price = Number(money[1].replace(/,/g, ''));
      const rest = line.replace(/₩\s*[\d,]+/, '').replace(/[,\s]+$/, '').trim();
      if (rest) items.push(rest);
      continue;
    }
    items.push(line);
  }

  return { items, price };
}

/**
 * 자연계처럼 한 칸에 [학생식당] / [교직원식당]이 함께 들어오는 경우
 * 구역별로 쪼개 별도 항목으로 만든다. 머리표가 없으면 그대로 한 덩어리.
 */
function splitSections(items, category) {
  const hasSection = items.some((item) => SECTION_MARK.test(item));
  if (!hasSection) return [{ category, items }];

  const groups = [];
  let current = null;

  for (const item of items) {
    const mark = item.match(SECTION_MARK);
    if (mark) {
      current = { category: `${category} · ${mark[1]}`, items: [] };
      groups.push(current);
      continue;
    }
    if (current) current.items.push(item);
  }

  return groups.filter((group) => group.items.length > 0);
}

/**
 * 기준 주를 지정하지 않으면 식당 안내 페이지를 그대로 읽는다. 그 페이지에 이미
 * 사이트가 정한 '이번 주' 표가 들어 있어서, 주 경계 계산을 우리가 흉내 낼 필요가 없다.
 * 다른 주가 필요할 때만 POST로 이동한다.
 */
async function fetchAnamWeek(hall, monday, week) {
  const { siteId, menuSeq, dietId } = hall.source;

  let baseMonday = monday;

  if (!baseMonday) {
    const html = await fetchWithRetry(
      `https://www.korea.ac.kr/${siteId}/${menuSeq}/subview.do`,
    );

    if (!week) return html;

    // --next/--prev는 사이트가 지금 보여주는 주를 기준으로 움직여야 한다.
    baseMonday = html.match(/name="monday" value="([^"]+)"/)?.[1] ?? mondayOf(new Date());
  }

  const body = new URLSearchParams({
    layout: layoutToken(siteId, menuSeq),
    monday: baseMonday,
    week: week ?? '',
  });

  return fetchWithRetry(`https://www.korea.ac.kr/diet/${siteId}/${dietId}/view.do`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

/** 안암 표: 행마다 th(날짜) / td.bdrLeft(식단구분) / td.left(내용) */
function parseAnam(html) {
  const $ = cheerio.load(html);
  const table = $('caption')
    .filter((_, el) => $(el).text().includes('일주일간 식단'))
    .first()
    .closest('table');

  if (!table.length) return { weeklyMenus: emptyWeek(), weekRange: null };

  const weeklyMenus = emptyWeek();
  let currentDay = null;

  table.find('tbody tr').each((_, tr) => {
    const row = $(tr);

    const th = row.find('th').first();
    if (th.length) {
      const m = th.text().match(/(\d{4})\.(\d{2})\.(\d{2})/);
      currentDay = m
        ? DAY_BY_INDEX[new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`).getDay()]
        : null;
    }
    if (!currentDay) return;

    const category = row.find('td.bdrLeft').first().text().replace(/\s+/g, ' ').trim();
    if (!category) return;

    const meal = mealSlotOf(category);
    if (!meal) return;

    const contentCell = row.find('td.left').first();
    if (!contentCell.length) return;

    const rawHtml = contentCell.html() ?? '';
    if (NO_MENU.test(cheerio.load(`<div>${rawHtml}</div>`)('div').text())) return;

    const { items, price } = parseMenuCell(rawHtml);
    if (items.length === 0) return;

    for (const group of splitSections(items, category)) {
      weeklyMenus[currentDay].push({ meal, category: group.category, items: group.items, price });
    }
  });

  const weekRange = $.text().match(/(\d{4}\.\d{2}\.\d{2})\.\s*~\s*(\d{4}\.\d{2}\.\d{2})/);
  return { weeklyMenus, weekRange: weekRange ? weekRange[0] : null };
}

function emptyWeek() {
  return { mon: [], tue: [], wed: [], thu: [], fri: [] };
}

async function main() {
  const args = process.argv.slice(2);
  const monday = args.includes('--monday') ? args[args.indexOf('--monday') + 1] : null;
  const week = args.includes('--next') ? 'next' : args.includes('--prev') ? 'prev' : '';

  console.log(
    monday || week
      ? `기준: ${monday ?? '이번 주'}${week ? ` (${week})` : ''}`
      : '기준: 사이트가 표시하는 이번 주',
  );

  const diningHalls = [];
  let weekRange = null;

  for (const hall of HALLS) {
    try {
      const parsed = parseAnam(await fetchAnamWeek(hall, monday, week));

      weekRange ??= parsed.weekRange;

      const count = Object.values(parsed.weeklyMenus).flat().length;
      console.log(
        `  ✓ ${hall.name.padEnd(16)} ${String(count).padStart(2)}건` +
          (parsed.weekRange ? `  [${parsed.weekRange}]` : ''),
      );

      // 식단구분 라벨을 그대로 태그로 쓴다 (임의로 지어내지 않는다).
      const tags = [
        ...new Set(Object.values(parsed.weeklyMenus).flat().map((m) => m.category)),
      ].slice(0, 4);

      diningHalls.push({
        id: hall.id,
        name: hall.name,
        campus: hall.campus,
        building: hall.building,
        address: hall.address,
        phone: hall.phone,
        note: hall.note,
        tags,
        imageUrl: null,
        hours: hall.hours,
        weeklyMenus: parsed.weeklyMenus,
      });
    } catch (error) {
      console.error(`  ✗ ${hall.name}: ${error.message}`);
      throw error;
    }
  }

  const payload = {
    source: '고려대학교 안암캠퍼스 공식 식당안내 (www.korea.ac.kr)',
    fetchedAt: new Date().toISOString(),
    weekOf: weekRange ?? monday,
    campuses: CAMPUSES,
    meals: MEALS,
    weekdays: WEEKDAYS,
    diningHalls,
  };

  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`\n저장: ${path.relative(ROOT, OUT)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
