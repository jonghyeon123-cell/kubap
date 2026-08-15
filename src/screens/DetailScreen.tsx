import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MEAL_ACCENT, MenuCard } from '../components/MenuCard';
import {
  formatKoreanTime,
  getHallStatus,
  getMenusForDay,
  MEAL_ORDER,
  mealLabel,
  weekdayKeyOf,
  weekdays,
} from '../data/diningHalls';
import type { DiningHall, WeekdayKey } from '../data/types';
import { useDiningData } from '../hooks/useDiningData';
import { useFavorites } from '../hooks/useFavorites';
import { useNowMinute } from '../hooks/useNowMinute';
import { colors, softShadow } from '../theme/tokens';

const HEADER_IMAGE_HEIGHT = 280;

/** "오늘" 탭은 실제 요일로 해석되고, 나머지는 고정 요일이다. */
type DayTab = 'today' | WeekdayKey;

interface DetailScreenProps {
  hall: DiningHall;
  onBack: () => void;
}

function FloatingIconButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={softShadow}
      className="rounded-full bg-black/20 p-2 active:scale-95"
    >
      <MaterialIcons name={icon} size={24} color="#ffffff" />
    </Pressable>
  );
}

export function DetailScreen({ hall, onBack }: DetailScreenProps) {
  const insets = useSafeAreaInsets();
  const now = useNowMinute();
  const { data } = useDiningData();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [dayTab, setDayTab] = useState<DayTab>('today');

  const status = getHallStatus(hall, now);
  const todayKey = weekdayKeyOf(now);
  const selectedDay: WeekdayKey | null = dayTab === 'today' ? todayKey : dayTab;
  const dayMenus = getMenusForDay(hall, selectedDay);

  // "오늘" 탭을 보고 있을 때만 현재 끼니를 강조한다.
  const currentMeal = status.isOpen && dayTab === 'today' ? status.meal : null;

  const saved = isFavorite(hall.id);

  const handleShare = () => {
    Share.share({ message: `${hall.name} · ${hall.building}\n${hall.address}` }).catch(
      () => {},
    );
  };

  const handleDirections = () => {
    // 지도에서는 도로명 주소보다 캠퍼스 건물명이 훨씬 잘 잡힌다.
    // "학생회관 2층" → "고려대학교 학생회관"
    const building = hall.building.replace(/\s*(?:지하\s*)?\d+층\s*$/, '').trim();
    const query = encodeURIComponent(`고려대학교 ${building || hall.name}`);

    const webUrl = `https://map.naver.com/p/search/${query}`;

    if (Platform.OS === 'web') {
      Linking.openURL(webUrl).catch(() => {});
      return;
    }

    // 네이버지도 앱이 깔려 있으면 앱으로, 아니면 웹으로 넘긴다.
    const appUrl = `nmap://search?query=${query}&appname=kr.ac.korea.kubap`;
    Linking.canOpenURL(appUrl)
      .then((supported) => Linking.openURL(supported ? appUrl : webUrl))
      .catch(() => Linking.openURL(webUrl))
      .catch(() => {});
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        {/* 헤더 이미지 + 그라데이션 위에 제목과 즐겨찾기 FAB */}
        <View style={{ height: HEADER_IMAGE_HEIGHT }} className="w-full bg-surface-container">
          {hall.imageUrl ? (
            <Image
              source={{ uri: hall.imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-surface-container-high">
              <MaterialIcons name="restaurant" size={64} color={colors.outline} />
            </View>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
            locations={[0, 0.5, 1]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}
          />

          <View className="absolute bottom-md left-container-padding right-container-padding flex-row items-end justify-between gap-md">
            <Text className="flex-1 font-sans-bold text-headline-lg-mobile text-white">
              {hall.name}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={saved ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              accessibilityState={{ selected: saved }}
              onPress={() => toggleFavorite(hall.id)}
              style={softShadow}
              className="h-14 w-14 items-center justify-center rounded-full bg-white active:scale-95"
            >
              <MaterialIcons
                name={saved ? 'favorite' : 'favorite-border'}
                size={26}
                color={colors.primaryContainer}
              />
            </Pressable>
          </View>
        </View>

        <View className="mt-xl gap-xl px-container-padding">
          {/* 위치 */}
          <View>
            <Text className="mb-md font-sans-bold text-headline-sm text-primary">위치</Text>
            <View
              style={softShadow}
              className="flex-row items-start gap-md rounded-xl bg-surface-container-lowest p-md"
            >
              <View className="flex-1">
                <View className="mb-xs flex-row items-center gap-xs">
                  <MaterialIcons
                    name="location-on"
                    size={20}
                    color={colors.primaryContainer}
                  />
                  <Text className="flex-1 font-sans text-body-md text-on-surface">
                    {hall.address}
                  </Text>
                </View>
                <Text className="ml-[24px] font-sans text-body-sm text-on-surface-variant">
                  {hall.building}
                </Text>
                {hall.phone ? (
                  <View className="mt-sm flex-row items-center gap-xs">
                    <MaterialIcons name="call" size={20} color={colors.primaryContainer} />
                    <Text className="font-sans text-body-sm text-on-surface-variant">
                      {hall.phone}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View className="h-20 w-20 shrink-0 items-center justify-center rounded-md border border-outline-variant/30 bg-surface-container">
                <MaterialIcons name="map" size={28} color={colors.outline} />
              </View>
            </View>
          </View>

          {/* 운영 시간 */}
          <View>
            <Text className="mb-md font-sans-bold text-headline-sm text-primary">
              운영 시간
            </Text>
            <View style={softShadow} className="rounded-xl bg-surface-container-lowest">
              {MEAL_ORDER.filter((meal) => hall.hours[meal]).map((meal, index) => {
                const range = hall.hours[meal]!;
                const isNow = status.isOpen && status.meal === meal;

                return (
                  <View
                    key={meal}
                    className={`flex-row items-center justify-between p-md ${
                      index > 0 ? 'border-t border-outline-variant/30' : ''
                    }`}
                  >
                    <View className="flex-row items-center gap-sm">
                      <View className={`h-2 w-2 rounded-full ${MEAL_ACCENT[meal].dot}`} />
                      <Text className="font-sans-semibold text-headline-sm text-on-surface">
                        {mealLabel(meal)}
                      </Text>
                    </View>
                    <Text
                      className={
                        isNow
                          ? 'font-sans-bold text-body-md text-primary'
                          : 'font-sans text-body-md text-on-surface-variant'
                      }
                    >
                      {range.start} ~ {range.end}
                    </Text>
                  </View>
                );
              })}
            </View>

            {hall.note ? (
              <View className="mt-sm flex-row items-start gap-xs rounded-md bg-surface-container-low p-sm">
                <MaterialIcons name="info-outline" size={16} color={colors.onSurfaceVariant} />
                <Text className="flex-1 font-sans text-body-sm text-on-surface-variant">
                  {hall.note}
                </Text>
              </View>
            ) : null}
          </View>

          {/* 식단표 */}
          <View>
            <View className="mb-md flex-row items-baseline justify-between gap-sm">
              <Text className="font-sans-bold text-headline-sm text-primary">식단표</Text>
              {data.weekOf ? (
                <Text className="font-sans text-body-sm text-on-surface-variant">
                  {data.weekOf}
                </Text>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="flex-row gap-sm pb-sm"
            >
              {([{ key: 'today', label: '오늘' }] as { key: DayTab; label: string }[])
                .concat(weekdays.map((day) => ({ key: day.key, label: day.label })))
                .map((tab) => {
                  const selected = tab.key === dayTab;
                  return (
                    <Pressable
                      key={tab.key}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setDayTab(tab.key)}
                      className={`shrink-0 rounded-full px-lg py-sm active:opacity-80 ${
                        selected ? 'bg-primary-container' : 'bg-surface-container-highest'
                      }`}
                    >
                      <Text
                        className={`font-sans-semibold text-label-md ${
                          selected ? 'text-on-primary' : 'text-on-surface-variant'
                        }`}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
            </ScrollView>

            <View className="mt-lg gap-md">
              {dayMenus.length > 0 ? (
                dayMenus.map((menu, index) => (
                  <MenuCard
                    key={`${menu.meal}-${menu.category}-${index}`}
                    menu={menu}
                    isCurrent={menu.meal === currentMeal}
                  />
                ))
              ) : (
                <View className="items-center gap-xs rounded-xl bg-surface-container-low p-xl">
                  <Text className="font-sans-semibold text-body-md text-on-surface">
                    {dayTab === 'today' && !todayKey
                      ? '주말에는 운영하지 않아요'
                      : '식단이 준비되지 않았어요'}
                  </Text>
                  <Text className="font-sans text-body-sm text-on-surface-variant">
                    {dayTab === 'today' && !todayKey
                      ? '월~금 식단은 요일 탭에서 볼 수 있어요'
                      : '다른 요일을 선택해보세요'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 이미지 위에 떠 있는 뒤로가기 / 공유 */}
      <View
        style={{ top: insets.top }}
        className="absolute left-0 right-0 flex-row justify-between px-container-padding"
      >
        <FloatingIconButton icon="arrow-back" label="뒤로가기" onPress={onBack} />
        <FloatingIconButton icon="share" label="공유" onPress={handleShare} />
      </View>

      {/* 하단 고정 길찾기 */}
      <LinearGradient
        colors={['transparent', 'rgba(252,249,248,0.9)', '#fcf9f8']}
        locations={[0, 0.4, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: insets.bottom + 20,
          paddingTop: 32,
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={handleDirections}
          className="h-14 flex-row items-center justify-center gap-sm rounded-full bg-primary-container active:scale-[0.98]"
        >
          <MaterialIcons name="directions" size={22} color={colors.onPrimary} />
          <Text className="font-sans-semibold text-headline-sm text-on-primary">길찾기</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}
