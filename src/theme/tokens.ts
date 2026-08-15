/**
 * Raw design tokens for the places className can't reach: vector icon colors,
 * React Navigation options, and shadow styles. Mirrors tailwind.config.js —
 * change both together.
 */
export const colors = {
  surface: '#fcf9f8',
  surfaceDim: '#dcd9d9',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainer: '#f0eded',
  surfaceContainerHigh: '#eae7e7',
  surfaceContainerHighest: '#e5e2e1',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#564242',
  outline: '#897172',
  outlineVariant: '#dcc0c0',
  /** 텍스트 · 아이콘 전용 */
  primary: '#670d1e',
  onPrimary: '#ffffff',
  /** 버튼 · 배지 전용 */
  primaryContainer: '#862633',
  onPrimaryContainer: '#ff9ea3',
  secondaryContainer: '#fed65b',
  tertiaryContainer: '#4b4944',
  surfaceVariant: '#e5e2e1',
} as const;

export const fonts = {
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  semibold: 'NotoSansKR_600SemiBold',
  bold: 'NotoSansKR_700Bold',
} as const;

/**
 * DESIGN.md "Soft Ambient Shadow". boxShadow(문자열)은 RN 0.76+ 신아키텍처와
 * 웹에서 모두 동작하며, 구형 `shadow` 계열 + `elevation` 조합과 달리
 * 플랫폼 간 렌더 결과가 같다.
 */
export const softShadow = {
  boxShadow: '0px 4px 20px rgba(26, 26, 26, 0.06)',
} as const;

/** 하단 내비게이션용 위쪽 그림자. */
export const navShadow = {
  boxShadow: '0px -4px 20px rgba(26, 26, 26, 0.04)',
} as const;

export const TAB_BAR_HEIGHT = 64;
