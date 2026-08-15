export type MealKey = 'breakfast' | 'lunch' | 'dinner';
/** 현재 안암캠퍼스만 다룬다. */
export type CampusKey = 'anam';
/** 학식은 평일만 운영하므로 주말 키는 없다. */
export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export interface TimeRange {
  /** "HH:mm" */
  start: string;
  /** "HH:mm" */
  end: string;
}

export interface MenuItem {
  /** 영업 상태 계산에 쓰는 시간대. */
  meal: MealKey;
  /** 학교가 쓰는 실제 식단구분 라벨. "중식(한식반상)", "중식 · 학생식당" 등. */
  category: string;
  /** 게시된 순서 그대로의 구성 품목. 첫 항목이 대표 메뉴다. */
  items: string[];
  /** 학교가 가격을 함께 게시한 경우에만 값이 있다. */
  price: number | null;
}

export interface DiningHall {
  id: string;
  name: string;
  campus: CampusKey;
  building: string;
  address: string;
  phone: string | null;
  /** 운영상 유의사항. 없으면 null. */
  note: string | null;
  tags: string[];
  imageUrl: string | null;
  hours: Partial<Record<MealKey, TimeRange>>;
  weeklyMenus: Record<WeekdayKey, MenuItem[]>;
}

export interface CampusMeta {
  key: CampusKey;
  label: string;
}

export interface MealMeta {
  key: MealKey;
  /** 조식 / 중식 / 석식 */
  label: string;
  /** 아침 / 점심 / 저녁 */
  shortLabel: string;
}

export interface WeekdayMeta {
  key: WeekdayKey;
  /** 월 / 화 / 수 / 목 / 금 */
  label: string;
}

export interface DiningData {
  /** 데이터 출처 표기. */
  source: string;
  /** 스크립트가 받아온 시각 (ISO). */
  fetchedAt: string;
  /** 식단이 해당하는 주. "2026.08.17. ~ 2026.08.23" */
  weekOf: string | null;
  campuses: CampusMeta[];
  meals: MealMeta[];
  weekdays: WeekdayMeta[];
  diningHalls: DiningHall[];
}

/** 지금 영업 중 — 어느 끼니이고 언제 닫는지. */
export interface OpenStatus {
  isOpen: true;
  meal: MealKey;
  closesAt: string;
}

/**
 * 영업 종료. 주말이면 isWeekend, 평일이면 오늘 남은 끼니를 nextMeal에 담는다.
 * 오늘 영업이 모두 끝났으면 nextMeal은 null이다.
 */
export interface ClosedStatus {
  isOpen: false;
  isWeekend: boolean;
  nextMeal: MealKey | null;
  opensAt: string | null;
}

export type HallStatus = OpenStatus | ClosedStatus;
