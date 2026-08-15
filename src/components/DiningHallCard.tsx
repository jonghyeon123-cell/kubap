import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  formatKoreanTime,
  getMenu,
  mealShortLabel,
  menuTitle,
  weekdayKeyOf,
} from '../data/diningHalls';
import type { DiningHall, HallStatus } from '../data/types';
import { colors, softShadow } from '../theme/tokens';

import { StatusBadge } from './StatusBadge';

interface DiningHallCardProps {
  hall: DiningHall;
  status: HallStatus;
  /** 오늘 식단을 고르는 기준 시각. status와 같은 시점이어야 한다. */
  now: Date;
  onPress?: () => void;
}

/** 카드 하단 하이라이트 줄에 들어갈 문구를 상태에서 끌어낸다. */
function buildHighlight(hall: DiningHall, status: HallStatus, now: Date) {
  if (status.isOpen) {
    const menu = getMenu(hall, status.meal, weekdayKeyOf(now));
    return {
      label: `오늘의 ${mealShortLabel(status.meal)}`,
      text: menu ? menuTitle(menu) : '메뉴 준비중',
    };
  }

  if (status.isWeekend) {
    return { label: '주말 휴무', text: '평일에 다시 만나요' };
  }

  if (status.nextMeal && status.opensAt) {
    return {
      label: `${mealShortLabel(status.nextMeal)} 메뉴 준비중`,
      text: `${formatKoreanTime(status.opensAt)} 오픈 예정`,
    };
  }

  return { label: '오늘 영업 종료', text: '내일 다시 만나요' };
}

export function DiningHallCard({ hall, status, now, onPress }: DiningHallCardProps) {
  const highlight = buildHighlight(hall, status, now);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${hall.name}, ${status.isOpen ? '영업중' : '영업종료'}`}
      onPress={onPress}
      style={softShadow}
      className="rounded-lg bg-surface-container-lowest p-md active:scale-[0.98]"
    >
      <View className="mb-sm flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <Text className="mb-1 font-sans-semibold text-headline-sm text-on-surface">
            {hall.name}
          </Text>
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
            <Text className="font-sans text-body-sm text-on-surface-variant">
              {hall.building}
            </Text>
          </View>
        </View>

        <StatusBadge isOpen={status.isOpen} />
      </View>

      <View
        className={`mt-md rounded-md border-l-2 bg-surface-container-low p-sm ${
          status.isOpen ? 'border-l-primary-container' : 'border-l-outline-variant'
        }`}
      >
        <Text className="font-sans text-body-sm text-on-surface-variant">
          <Text
            className={`font-sans-bold ${
              status.isOpen ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            {highlight.label}
          </Text>
          {'  '}
          <Text className={status.isOpen ? 'text-on-surface' : 'text-on-surface-variant'}>
            {highlight.text}
          </Text>
        </Text>
      </View>
    </Pressable>
  );
}
