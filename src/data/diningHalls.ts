import raw from '../../data/dining-halls.json';

import type {
  CampusMeta,
  DiningData,
  DiningHall,
  HallStatus,
  MealKey,
  MealMeta,
  MenuItem,
  WeekdayKey,
  WeekdayMeta,
} from './types';

const data = raw as DiningData;

export const campuses: CampusMeta[] = data.campuses;
export const meals: MealMeta[] = data.meals;
export const weekdays: WeekdayMeta[] = data.weekdays;
export const diningHalls: DiningHall[] = data.diningHalls;

/** 데이터 출처와 기준 주 — 화면에 그대로 표시해 신선도를 드러낸다. */
export const dataSource = {
  source: data.source,
  fetchedAt: data.fetchedAt,
  weekOf: data.weekOf,
};

/** 메뉴의 대표 이름. 목록·검색에서 한 줄로 보여줄 때 쓴다. */
export function menuTitle(menu: MenuItem): string {
  return menu.items[0] ?? '';
}

/** 대표 메뉴를 뺀 나머지 구성. */
export function menuSides(menu: MenuItem): string {
  return menu.items.slice(1).join(', ');
}

export const MEAL_ORDER: MealKey[] = ['breakfast', 'lunch', 'dinner'];

const mealMetaByKey = new Map(meals.map((meal) => [meal.key, meal]));
const weekdayMetaByKey = new Map(weekdays.map((day) => [day.key, day]));

/** Date.getDay() 인덱스(0=일)를 요일 키로. 주말은 null. */
const DAY_INDEX_TO_KEY: (WeekdayKey | null)[] = [
  null,
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  null,
];

/** 조식 / 중식 / 석식 */
export function mealLabel(meal: MealKey): string {
  return mealMetaByKey.get(meal)?.label ?? meal;
}

/** 아침 / 점심 / 저녁 */
export function mealShortLabel(meal: MealKey): string {
  return mealMetaByKey.get(meal)?.shortLabel ?? meal;
}

/** 월 / 화 / 수 / 목 / 금 */
export function weekdayLabel(day: WeekdayKey): string {
  return weekdayMetaByKey.get(day)?.label ?? day;
}

/** 해당 날짜의 요일 키. 주말이면 null. */
export function weekdayKeyOf(date: Date): WeekdayKey | null {
  return DAY_INDEX_TO_KEY[date.getDay()];
}

export function getHallById(id: string): DiningHall | undefined {
  return diningHalls.find((hall) => hall.id === id);
}

/** 해당 요일의 식단. 주말(null)이면 빈 배열. */
export function getMenusForDay(hall: DiningHall, day: WeekdayKey | null): MenuItem[] {
  if (!day) return [];
  return hall.weeklyMenus[day] ?? [];
}

export function getMenu(
  hall: DiningHall,
  meal: MealKey,
  day: WeekdayKey | null,
): MenuItem | undefined {
  return getMenusForDay(hall, day).find((menu) => menu.meal === meal);
}

/** 한 식당의 주간 식단 전체를 요일 구분 없이 펼친다. */
export function allMenus(hall: DiningHall): MenuItem[] {
  return Object.values(hall.weeklyMenus).flat();
}

export interface SearchHit {
  hall: DiningHall;
  /** 식당 이름이 아니라 메뉴로 걸린 경우, 어떤 메뉴가 걸렸는지. */
  matchedMenu: MenuItem | null;
}

/**
 * 식당 이름 · 건물 · 태그를 먼저 보고, 없으면 주간 식단에서 찾는다.
 * 메뉴로 걸린 결과는 어떤 메뉴 때문인지 함께 돌려줘서 화면에 근거를 보여줄 수 있게 한다.
 */
export function searchHalls(query: string): SearchHit[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const hits: SearchHit[] = [];

  for (const hall of diningHalls) {
    const inHall = [hall.name, hall.building, ...hall.tags].some((field) =>
      field.toLowerCase().includes(term),
    );

    if (inHall) {
      hits.push({ hall, matchedMenu: null });
      continue;
    }

    const matchedMenu = allMenus(hall).find((menu) =>
      menu.items.some((item) => item.toLowerCase().includes(term)),
    );

    if (matchedMenu) hits.push({ hall, matchedMenu });
  }

  return hits;
}

/** "HH:mm" → 자정 기준 분. */
function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** "17:00" → "오후 5시", "17:30" → "오후 5시 30분" */
export function formatKoreanTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? '오전' : '오후';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0
    ? `${period} ${displayHour}시`
    : `${period} ${displayHour}시 ${minutes}분`;
}

/** 5500 → "5,500원" */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * 현재 시각이 어느 운영 시간대에 들어가는지 판단한다.
 * 주말은 무조건 휴무이고, 평일에 어느 구간에도 없으면 오늘 남은 다음 끼니를 알려준다.
 */
export function getHallStatus(hall: DiningHall, now: Date = new Date()): HallStatus {
  if (!weekdayKeyOf(now)) {
    return { isOpen: false, isWeekend: true, nextMeal: null, opensAt: null };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const meal of MEAL_ORDER) {
    const range = hall.hours[meal];
    if (!range) continue;
    if (nowMinutes >= toMinutes(range.start) && nowMinutes < toMinutes(range.end)) {
      return { isOpen: true, meal, closesAt: range.end };
    }
  }

  for (const meal of MEAL_ORDER) {
    const range = hall.hours[meal];
    if (!range) continue;
    if (nowMinutes < toMinutes(range.start)) {
      return { isOpen: false, isWeekend: false, nextMeal: meal, opensAt: range.start };
    }
  }

  return { isOpen: false, isWeekend: false, nextMeal: null, opensAt: null };
}
