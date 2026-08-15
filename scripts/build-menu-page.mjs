#!/usr/bin/env node
/**
 * data/dining-halls.json → 주간 식단 웹페이지(HTML).
 *
 *   node scripts/build-menu-page.mjs [출력경로]
 *
 * 앱과 같은 Crimson Heritage 토큰(crimson_heritage/DESIGN.md)을 쓴다.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const DAYS = [
  { key: 'mon', label: '월', date: '8월 17일' },
  { key: 'tue', label: '화', date: '8월 18일' },
  { key: 'wed', label: '수', date: '8월 19일' },
  { key: 'thu', label: '목', date: '8월 20일' },
  { key: 'fri', label: '금', date: '8월 21일' },
];

/** 학교 식단표에 '대체공휴일'로 게시된 날. */
const DAY_NOTES = { mon: '대체공휴일 — 전 식당 미운영' };

const MEAL_LABEL = { breakfast: '조식', lunch: '중식', dinner: '석식' };

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const won = (n) => `${n.toLocaleString('ko-KR')}원`;

function renderMenu(menu) {
  // 학교가 빈 칸을 '-'로 채워둔 자리는 버린다.
  const items = menu.items.filter((item) => item && item !== '-');
  if (items.length === 0) return '';

  const [lead, ...rest] = items;

  return `
          <li class="menu menu--${esc(menu.meal)}">
            <div class="menu__head">
              <span class="menu__cat">${esc(menu.category)}</span>
              ${menu.price !== null ? `<span class="menu__price">${esc(won(menu.price))}</span>` : ''}
            </div>
            <p class="menu__lead">${esc(lead)}</p>
            ${rest.length ? `<p class="menu__rest">${esc(rest.join(' · '))}</p>` : ''}
          </li>`;
}

function renderHall(hall, dayKey) {
  const menus = (hall.weeklyMenus[dayKey] ?? []).filter(
    (m) => m.items.filter((i) => i && i !== '-').length > 0,
  );
  if (menus.length === 0) return '';

  const order = { breakfast: 0, lunch: 1, dinner: 2 };
  menus.sort((a, b) => order[a.meal] - order[b.meal]);

  return `
        <article class="hall">
          <header class="hall__head">
            <h3 class="hall__name">${esc(hall.name)}</h3>
            <p class="hall__where">${esc(hall.building)}</p>
          </header>
          <ul class="hall__menus">${menus.map(renderMenu).join('')}
          </ul>
        </article>`;
}

function renderDay(day, halls) {
  const cards = halls.map((hall) => renderHall(hall, day.key)).filter(Boolean);
  const note = DAY_NOTES[day.key];

  const body = cards.length
    ? `<div class="halls">${cards.join('')}
      </div>`
    : `<p class="day__empty">${esc(note ?? '등록된 식단이 없습니다.')}</p>`;

  return `
    <section class="day" id="day-${day.key}">
      <div class="day__head">
        <h2 class="day__title"><span class="day__dow">${esc(day.label)}</span>${esc(day.date)}</h2>
        ${cards.length && note ? `<p class="day__note">${esc(note)}</p>` : ''}
      </div>
      ${body}
    </section>`;
}

async function main() {
  const outPath = path.resolve(
    process.argv[2] ?? path.join(ROOT, 'build', 'weekly-menu.html'),
  );

  const data = JSON.parse(
    await readFile(path.join(ROOT, 'data', 'dining-halls.json'), 'utf8'),
  );

  // 이번 주 식단이 하나라도 있는 식당만 싣는다.
  const halls = data.diningHalls.filter((hall) =>
    Object.values(hall.weeklyMenus).flat().length > 0,
  );

  const totalMenus = halls.reduce(
    (sum, hall) => sum + Object.values(hall.weeklyMenus).flat().length,
    0,
  );

  const fetched = new Date(data.fetchedAt);
  const fetchedLabel = `${fetched.getFullYear()}.${String(fetched.getMonth() + 1).padStart(2, '0')}.${String(fetched.getDate()).padStart(2, '0')}`;

  const html = `<title>고려대 이번 주 학식 · ${esc(data.weekOf ?? '')}</title>
<style>
  /* Crimson Heritage — crimson_heritage/DESIGN.md 토큰 기반 */
  :root {
    --ground: #fcf9f8;
    --surface: #ffffff;
    --surface-alt: #f6f3f2;
    --ink: #1c1b1b;
    --ink-soft: #564242;
    --ink-faint: #897172;
    --line: #ebdfdf;
    --brand: #670d1e;
    --brand-fill: #862633;
    --on-fill: #ffffff;
    --accent-breakfast: #e0b93f;
    --accent-lunch: #862633;
    --accent-dinner: #4b4944;
    --shadow: 0 4px 20px rgba(26, 26, 26, 0.06);
    --radius: 16px;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ground: #171515;
      --surface: #211e1e;
      --surface-alt: #292525;
      --ink: #f3f0ef;
      --ink-soft: #c9b9b9;
      --ink-faint: #9c8888;
      --line: #382f2f;
      --brand: #ffb3b6;
      --brand-fill: #8e2a37;
      --on-fill: #ffffff;
      --accent-breakfast: #e9c349;
      --accent-lunch: #ff9ea3;
      --accent-dinner: #cac6bf;
      --shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    }
  }

  :root[data-theme="dark"] {
    --ground: #171515;
    --surface: #211e1e;
    --surface-alt: #292525;
    --ink: #f3f0ef;
    --ink-soft: #c9b9b9;
    --ink-faint: #9c8888;
    --line: #382f2f;
    --brand: #ffb3b6;
    --brand-fill: #8e2a37;
    --on-fill: #ffffff;
    --accent-breakfast: #e9c349;
    --accent-lunch: #ff9ea3;
    --accent-dinner: #cac6bf;
    --shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  }

  /* 한글 본문이라 웹폰트 대신 고품질 고딕 시스템 스택을 쓴다.
     (CSP가 폰트 CDN을 막고, 한글 폰트는 data URI로 인라인하기엔 너무 크다) */
  body {
    margin: 0;
    background: var(--ground);
    color: var(--ink);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo',
      'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .wrap {
    max-width: 1080px;
    margin: 0 auto;
    padding: 40px 20px 72px;
  }

  /* ── 머리말 ───────────────────────────── */
  .masthead { display: flex; flex-direction: column; gap: 10px; }

  .eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--brand);
    margin: 0;
  }

  .masthead h1 {
    margin: 0;
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    text-wrap: balance;
    color: var(--ink);
  }

  .masthead__week {
    margin: 0;
    font-size: 18px;
    color: var(--ink-soft);
    font-variant-numeric: tabular-nums;
  }

  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin: 16px 0 0;
    padding: 14px 0 0;
    border-top: 1px solid var(--line);
    list-style: none;
    font-size: 13px;
    color: var(--ink-faint);
  }
  .facts b { color: var(--ink-soft); font-weight: 600; font-variant-numeric: tabular-nums; }

  /* ── 요일 바로가기 ─────────────────────── */
  .daynav {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    gap: 8px;
    margin: 28px 0 8px;
    padding: 12px 0;
    background: var(--ground);
    border-bottom: 1px solid var(--line);
    overflow-x: auto;
  }
  .daynav a {
    flex: 0 0 auto;
    padding: 7px 15px;
    border-radius: 999px;
    background: var(--surface-alt);
    border: 1px solid var(--line);
    color: var(--ink-soft);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    font-variant-numeric: tabular-nums;
  }
  .daynav a:hover { border-color: var(--brand); color: var(--brand); }
  .daynav a:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

  /* ── 하루 ─────────────────────────────── */
  .day { padding-top: 34px; scroll-margin-top: 68px; }

  .day__head { margin-bottom: 16px; }

  .day__title {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin: 0;
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }

  .day__dow {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    background: var(--brand-fill);
    color: var(--on-fill);
    font-size: 14px;
    font-weight: 700;
  }

  .day__note, .day__empty {
    margin: 8px 0 0;
    font-size: 14px;
    color: var(--ink-faint);
  }

  .day__empty {
    padding: 22px;
    border: 1px dashed var(--line);
    border-radius: var(--radius);
    background: var(--surface-alt);
    text-align: center;
  }

  /* ── 식당 카드 ────────────────────────── */
  .halls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(272px, 1fr));
    gap: 16px;
  }

  .hall {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }

  .hall__head { display: flex; flex-direction: column; gap: 2px; }
  .hall__name { margin: 0; font-size: 17px; font-weight: 700; color: var(--ink); }
  .hall__where { margin: 0; font-size: 13px; color: var(--ink-faint); }

  .hall__menus {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* ── 한 끼 ────────────────────────────── */
  .menu {
    padding: 12px 14px;
    border-left: 3px solid var(--accent-lunch);
    border-radius: 0 10px 10px 0;
    background: var(--surface-alt);
  }
  .menu--breakfast { border-left-color: var(--accent-breakfast); }
  .menu--lunch { border-left-color: var(--accent-lunch); }
  .menu--dinner { border-left-color: var(--accent-dinner); }

  .menu__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
  }

  .menu__cat {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--brand);
  }

  .menu__price {
    flex: 0 0 auto;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-soft);
    font-variant-numeric: tabular-nums;
  }

  .menu__lead { margin: 0; font-size: 15px; font-weight: 600; color: var(--ink); }
  .menu__rest { margin: 4px 0 0; font-size: 13px; line-height: 1.55; color: var(--ink-soft); }

  /* ── 꼬리말 ───────────────────────────── */
  .colophon {
    margin-top: 56px;
    padding-top: 20px;
    border-top: 1px solid var(--line);
    font-size: 13px;
    color: var(--ink-faint);
  }
  .colophon p { margin: 0 0 8px; }
  .colophon a { color: var(--brand); text-decoration: underline; text-underline-offset: 2px; }
  .colophon a:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

  @media (max-width: 520px) {
    .wrap { padding: 28px 16px 56px; }
    .halls { grid-template-columns: 1fr; }
  }
</style>

<div class="wrap">
  <header class="masthead">
    <p class="eyebrow">고려대학교 안암캠퍼스</p>
    <h1>이번 주 학식</h1>
    <p class="masthead__week">${esc(data.weekOf ?? '')}</p>
    <ul class="facts">
      <li><b>${halls.length}</b>개 식당</li>
      <li><b>${totalMenus}</b>건의 식단</li>
      <li>기준 <b>${esc(fetchedLabel)}</b></li>
    </ul>
  </header>

  <nav class="daynav" aria-label="요일 바로가기">
    ${DAYS.map((d) => `<a href="#day-${d.key}">${esc(d.label)} ${esc(d.date.replace('8월 ', '8/').replace('일', ''))}</a>`).join('\n    ')}
  </nav>

  <main>${DAYS.map((day) => renderDay(day, halls)).join('')}
  </main>

  <footer class="colophon">
    <p>출처: 고려대학교 공식 식당안내 —
      <a href="https://www.korea.ac.kr/ko/508/subview.do">학생회관</a> ·
      <a href="https://www.korea.ac.kr/ko/504/subview.do">자연계</a> ·
      <a href="https://www.korea.ac.kr/ko/505/subview.do">안암학사</a> ·
      <a href="https://www.korea.ac.kr/ko/506/subview.do">산학관</a>
    </p>
    <p>제공 메뉴와 원산지는 식자재 수급 상황에 따라 바뀔 수 있습니다. 정확한 정보는 각 식당 입구의 일일 메뉴표를 확인하세요.</p>
    <p>가격은 학교가 식단표에 함께 게시한 경우에만 표시됩니다. 조식은 방학 중 미운영이라 이번 주 등록분이 없습니다.</p>
  </footer>
</div>
`;

  await writeFile(outPath, html, 'utf8');
  console.log(`생성: ${path.relative(ROOT, outPath)}  (${halls.length}개 식당 / ${totalMenus}건)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
