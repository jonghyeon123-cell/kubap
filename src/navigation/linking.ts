import type { LinkingOptions } from '@react-navigation/native';

import { SITE_BASE_PATH, SITE_ORIGIN, WEB_BASE_PATH } from '../config';

import type { RootStackParamList } from './types';

/**
 * linking을 켜야 화면 이동이 브라우저 히스토리에 쌓인다.
 * 이게 없으면 상세 화면에서 뒤로가기를 눌렀을 때 앱 자체가 닫힌다.
 *
 * 배포본은 /kubap 하위에서 도는데 React Navigation에는 base path 개념이 없다.
 * getPathFromState만 감싸면 경로를 읽는 쪽과 쓰는 쪽이 어긋나므로,
 * 아예 라우팅 설정의 경로에 접두 세그먼트를 넣어 양방향을 한 번에 맞춘다.
 */
const baseSegment = WEB_BASE_PATH.replace(/^\//, '');

const prefixed = (path: string) => (baseSegment ? `${baseSegment}/${path}` : path);

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['kubap://', `${SITE_ORIGIN}${SITE_BASE_PATH}`],

  config: {
    screens: {
      Tabs: {
        // 하위 화면 경로 앞에 붙는다. 비어 있으면 루트에서 도는 개발 서버.
        ...(baseSegment ? { path: baseSegment } : {}),
        screens: {
          Home: '',
          DiningHalls: 'halls',
          Favorites: 'favorites',
          Profile: 'profile',
        },
      },
      HallDetail: prefixed('hall/:hallId'),
    },
  },
};
