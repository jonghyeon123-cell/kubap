import { Platform } from 'react-native';

/** GitHub Pages가 앱을 서빙하는 위치. app.json의 experiments.baseUrl과 같아야 한다. */
export const SITE_ORIGIN = 'https://jonghyeon123-cell.github.io';
export const SITE_BASE_PATH = '/kubap';

/** GitHub Actions가 매주 갱신해 올리는 식단 파일. */
export const DINING_DATA_URL = `${SITE_ORIGIN}${SITE_BASE_PATH}/dining-halls.json`;

/**
 * 웹에서 실제로 붙어 있는 하위 경로.
 * 배포본은 /kubap 아래에서 돌고, 개발 서버는 루트에서 돈다.
 * 라우팅 경로를 만들 때 이 값을 앞뒤로 붙였다 뗐다 해야 뒤로가기가 어긋나지 않는다.
 *
 * 현재 경로가 아니라 오리진으로 판단한다. 상세 URL로 곧바로 진입했을 때
 * 경로만 보면 접두사를 놓쳐서, 이후 주소가 /kubap 밖으로 새어나간다.
 */
function detectWebBasePath(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return '';
  if (window.location.origin === SITE_ORIGIN) return SITE_BASE_PATH;
  // 로컬에서 배포 구조를 흉내 낼 때.
  return window.location.pathname.startsWith(`${SITE_BASE_PATH}/`) ||
    window.location.pathname === SITE_BASE_PATH
    ? SITE_BASE_PATH
    : '';
}

export const WEB_BASE_PATH = detectWebBasePath();
