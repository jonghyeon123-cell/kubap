import { Text, View } from 'react-native';

import { formatPrice, menuSides, menuTitle } from '../data/diningHalls';
import type { MealKey, MenuItem } from '../data/types';
import { softShadow } from '../theme/tokens';

/** 끼니별 강조색. 조식=골드, 중식=크림슨, 석식=차콜 (restaurant 레퍼런스 기준) */
export const MEAL_ACCENT: Record<MealKey, { dot: string; border: string }> = {
  breakfast: { dot: 'bg-secondary-container', border: 'border-l-secondary-container' },
  lunch: { dot: 'bg-primary-container', border: 'border-l-primary-container' },
  dinner: { dot: 'bg-tertiary-container', border: 'border-l-tertiary-container' },
};

interface MenuCardProps {
  menu: MenuItem;
  /** 지금 운영 중인 끼니면 대표 메뉴를 굵게 강조한다. */
  isCurrent: boolean;
}

export function MenuCard({ menu, isCurrent }: MenuCardProps) {
  const sides = menuSides(menu);

  return (
    <View
      style={softShadow}
      className={`rounded-lg border-l-4 bg-surface-container-lowest p-md ${
        MEAL_ACCENT[menu.meal].border
      }`}
    >
      <View className="mb-sm flex-row items-start justify-between gap-sm">
        {/* 학교가 게시한 식단구분을 그대로 쓴다. */}
        <Text className="flex-1 font-sans-semibold text-headline-sm text-on-surface">
          {menu.category}
        </Text>
        {menu.price !== null ? (
          <Text className="rounded-md bg-surface-variant px-2 py-1 font-sans-semibold text-label-md text-on-surface-variant">
            {formatPrice(menu.price)}
          </Text>
        ) : null}
      </View>

      <Text
        className={
          isCurrent
            ? 'mb-xs font-sans-bold text-body-md text-on-surface'
            : 'mb-xs font-sans text-body-md text-on-surface'
        }
      >
        {menuTitle(menu)}
      </Text>

      {sides ? (
        <Text className="font-sans text-body-sm text-on-surface-variant">{sides}</Text>
      ) : null}
    </View>
  );
}
