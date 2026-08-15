#!/usr/bin/env node
/**
 * Expo 웹 빌드 + 정적 식단표를 GitHub Pages용 build/ 하나로 합친다.
 *
 *   node scripts/build-web.mjs
 *
 * 결과 구조 (https://jonghyeon123-cell.github.io/kubap/):
 *   /                    앱 (Expo web, SPA)
 *   /404.html            새로고침 시 SPA로 되돌리기 위한 Pages 폴백
 *   /manifest.json       홈 화면에 추가했을 때 앱처럼 뜨게 하는 설정
 *   /icons/*.png         홈 화면 아이콘
 *   /weekly-menu.html    정적 주간 식단표
 *   /dining-halls.json   앱이 런타임에 받아가는 데이터
 */
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, 'build');
const EXPO_OUT = path.join(ROOT, '.expo-web');

/** Pages는 하위 경로로 서빙되므로 절대경로 자원이 /kubap 아래를 가리켜야 한다. */
const BASE_PATH = '/kubap';

function run(command, args) {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
}

/** Expo가 만든 index.html에 PWA 태그를 심는다. */
function injectPwaTags(html) {
  const tags = [
    `<link rel="manifest" href="${BASE_PATH}/manifest.json">`,
    // Expo가 theme-color를 이미 넣었으면 중복으로 넣지 않는다.
    ...(html.includes('name="theme-color"')
      ? []
      : [`<meta name="theme-color" content="#862633">`]),
    `<link rel="apple-touch-icon" href="${BASE_PATH}/icons/apple-touch-icon.png">`,
    `<link rel="icon" type="image/png" href="${BASE_PATH}/icons/favicon.png">`,
    `<meta name="apple-mobile-web-app-capable" content="yes">`,
    `<meta name="apple-mobile-web-app-status-bar-style" content="default">`,
    `<meta name="apple-mobile-web-app-title" content="KU밥">`,
  ].join('\n    ');

  if (html.includes('rel="manifest"')) return html; // 이미 들어 있으면 건드리지 않는다.
  return html.replace('</head>', `    ${tags}\n  </head>`);
}

async function main() {
  await rm(BUILD, { recursive: true, force: true });
  await rm(EXPO_OUT, { recursive: true, force: true });

  // 1) 앱 웹 빌드
  run('npx', ['expo', 'export', '--platform', 'web', '--output-dir', '.expo-web']);

  // 2) 앱 산출물을 build/로
  await cp(EXPO_OUT, BUILD, { recursive: true });
  await rm(EXPO_OUT, { recursive: true, force: true });

  // 3) PWA 자원
  await cp(path.join(ROOT, 'web', 'icons'), path.join(BUILD, 'icons'), { recursive: true });
  await cp(path.join(ROOT, 'web', 'manifest.json'), path.join(BUILD, 'manifest.json'));

  const indexPath = path.join(BUILD, 'index.html');
  const index = injectPwaTags(await readFile(indexPath, 'utf8'));
  await writeFile(indexPath, index, 'utf8');

  // 4) Pages는 없는 경로에 404.html을 준다. SPA라 index와 같은 내용을 둬야 새로고침이 깨지지 않는다.
  await writeFile(path.join(BUILD, '404.html'), index, 'utf8');

  // 5) 정적 식단표와 데이터 엔드포인트
  run('node', ['scripts/build-menu-page.mjs']);
  await cp(
    path.join(ROOT, 'data', 'dining-halls.json'),
    path.join(BUILD, 'dining-halls.json'),
  );

  const entries = await readdir(BUILD);
  console.log(`\nbuild/ 최상위: ${entries.sort().join(', ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
