/**
 * 고려대학교 안암캠퍼스 공식 식당안내 페이지에서 확인한 값들.
 *
 *   https://www.korea.ac.kr/ko/{menuSeq}/subview.do
 *   주간 식단은 POST https://www.korea.ac.kr/diet/ko/{dietId}/view.do
 *
 * hours / phone / building은 각 공식 페이지에 게시된 값이다.
 * 메뉴 내용만 스크립트가 매주 갱신하고, 아래 메타데이터는 손으로 관리한다.
 *
 * 세종캠퍼스는 다루지 않는다 (요청에 따라 제외).
 */
export const ANAM_ADDRESS = '서울특별시 성북구 안암로 145';

export const HALLS = [
  {
    id: 'student-union',
    name: '학생회관 학생식당',
    campus: 'anam',
    building: '학생회관 2층',
    address: ANAM_ADDRESS,
    phone: '070-4242-1815',
    source: { kind: 'anam', siteId: 'ko', menuSeq: 508, dietId: 13 },
    hours: {
      breakfast: { start: '08:00', end: '09:30' },
      lunch: { start: '11:00', end: '14:00' },
    },
    note: '방학 중에는 조식(천원의아침)이 운영되지 않습니다.',
  },
  {
    id: 'science-hall',
    name: '자연계 학생식당',
    campus: 'anam',
    building: '애기능생활관 2층',
    address: ANAM_ADDRESS,
    phone: '02-3290-4351',
    source: { kind: 'anam', siteId: 'ko', menuSeq: 504, dietId: 9 },
    hours: {
      breakfast: { start: '08:00', end: '09:30' },
      lunch: { start: '11:00', end: '13:30' },
      dinner: { start: '17:30', end: '19:00' },
    },
    note: '중식 11:00~13:30은 학생식당 기준이며, 석식은 교직원식당에서 운영합니다.',
  },
  {
    id: 'anam-dorm',
    name: '안암학사 식당',
    campus: 'anam',
    building: '안암학사 관리동 2층',
    address: ANAM_ADDRESS,
    phone: '070-4120-3229',
    source: { kind: 'anam', siteId: 'ko', menuSeq: 505, dietId: 10 },
    hours: {
      breakfast: { start: '08:00', end: '09:30' },
      lunch: { start: '11:30', end: '14:00' },
      dinner: { start: '17:00', end: '19:00' },
    },
    note: '조식은 준비 수량 소진 시 조기 마감됩니다.',
  },
  {
    id: 'sanhak-hall',
    name: '산학관 식당',
    campus: 'anam',
    building: '산학관 1층',
    address: ANAM_ADDRESS,
    phone: '02-921-5770',
    source: { kind: 'anam', siteId: 'ko', menuSeq: 506, dietId: 11 },
    hours: {
      lunch: { start: '11:20', end: '13:50' },
      dinner: { start: '17:30', end: '18:50' },
    },
    note: '토요일은 중식(11:20~13:30)만 운영합니다. 석식 라스트오더 18:30.',
  },
];

export const CAMPUSES = [{ key: 'anam', label: '안암캠퍼스' }];

export const MEALS = [
  { key: 'breakfast', label: '조식', shortLabel: '아침' },
  { key: 'lunch', label: '중식', shortLabel: '점심' },
  { key: 'dinner', label: '석식', shortLabel: '저녁' },
];

export const WEEKDAYS = [
  { key: 'mon', label: '월' },
  { key: 'tue', label: '화' },
  { key: 'wed', label: '수' },
  { key: 'thu', label: '목' },
  { key: 'fri', label: '금' },
];
