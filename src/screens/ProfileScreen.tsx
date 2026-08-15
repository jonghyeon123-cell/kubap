import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TopAppBar } from '../components/TopAppBar';
import { dataSource, diningHalls } from '../data/diningHalls';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useRootNavigation } from '../navigation/types';
import { colors, softShadow, TAB_BAR_HEIGHT } from '../theme/tokens';

/** 되돌릴 수 없는 삭제는 한 번 더 물어본다. */
type PendingAction = 'searches' | 'favorites' | null;

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-md font-sans-bold text-headline-sm text-primary">{children}</Text>
  );
}

function StatCard({
  icon,
  value,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: number;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label} ${value}`}
      onPress={onPress}
      disabled={!onPress}
      style={softShadow}
      className="flex-1 gap-sm rounded-lg bg-surface-container-lowest p-md active:scale-[0.98]"
    >
      <MaterialIcons name={icon} size={22} color={colors.primaryContainer} />
      <View>
        <Text className="font-sans-bold text-headline-md text-on-surface">{value}</Text>
        <Text className="font-sans text-body-sm text-on-surface-variant">{label}</Text>
      </View>
    </Pressable>
  );
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useRootNavigation();

  const { favoriteIds, clearFavorites } = useFavorites();
  const { recent, clearRecent } = useRecentSearches();

  const [pending, setPending] = useState<PendingAction>(null);

  const version = Constants.expoConfig?.version ?? '1.0.0';

  const runPending = () => {
    if (pending === 'searches') clearRecent();
    if (pending === 'favorites') clearFavorites();
    setPending(null);
  };

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title="KU밥" leading={{ icon: 'menu', label: '메뉴' }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
        }}
      >
        {/* 프로필 헤더 — 로그인 기능이 없으므로 게스트로 표시한다. */}
        <View
          style={softShadow}
          className="mb-xl flex-row items-center gap-md rounded-lg bg-surface-container-lowest p-md"
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-container">
            <MaterialIcons name="person" size={32} color={colors.onPrimary} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-headline-sm text-on-surface">게스트</Text>
            <Text className="font-sans text-body-sm text-on-surface-variant">
              안암캠퍼스 · 식당 {diningHalls.length}곳
            </Text>
          </View>
        </View>

        {/* 내 활동 */}
        <View className="mb-xl">
          <SectionTitle>내 활동</SectionTitle>
          <View className="flex-row gap-md">
            <StatCard
              icon="favorite"
              value={favoriteIds.length}
              label="즐겨찾는 식당"
              onPress={() => navigation.navigate('Tabs', { screen: 'Favorites' })}
            />
            <StatCard icon="history" value={recent.length} label="최근 검색어" />
          </View>
        </View>

        {/* 데이터 관리 */}
        <View className="mb-xl">
          <SectionTitle>데이터 관리</SectionTitle>

          {pending ? (
            <View
              style={softShadow}
              className="gap-md rounded-lg border-l-4 border-l-error bg-surface-container-lowest p-md"
            >
              <Text className="font-sans-semibold text-body-md text-on-surface">
                {pending === 'searches'
                  ? '최근 검색어를 모두 지울까요?'
                  : '즐겨찾기를 모두 지울까요?'}
              </Text>
              <Text className="font-sans text-body-sm text-on-surface-variant">
                지운 기록은 되돌릴 수 없어요
              </Text>
              <View className="flex-row gap-sm">
                <Pressable
                  accessibilityRole="button"
                  onPress={runPending}
                  className="flex-1 items-center rounded-md bg-error px-4 py-3 active:opacity-80"
                >
                  <Text className="font-sans-bold text-body-md text-on-error">삭제</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPending(null)}
                  className="flex-1 items-center rounded-md bg-surface-variant px-4 py-3 active:opacity-80"
                >
                  <Text className="font-sans-bold text-body-md text-on-surface-variant">
                    취소
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={softShadow} className="rounded-lg bg-surface-container-lowest">
              <Pressable
                accessibilityRole="button"
                onPress={() => setPending('searches')}
                disabled={recent.length === 0}
                className="flex-row items-center gap-md p-md active:opacity-70"
              >
                <MaterialIcons
                  name="history"
                  size={22}
                  color={recent.length === 0 ? colors.outline : colors.onSurfaceVariant}
                />
                <Text
                  className={`flex-1 font-sans text-body-md ${
                    recent.length === 0 ? 'text-outline' : 'text-on-surface'
                  }`}
                >
                  최근 검색어 삭제
                </Text>
                <Text className="font-sans text-body-sm text-on-surface-variant">
                  {recent.length}개
                </Text>
              </Pressable>

              <View className="h-px bg-outline-variant/30" />

              <Pressable
                accessibilityRole="button"
                onPress={() => setPending('favorites')}
                disabled={favoriteIds.length === 0}
                className="flex-row items-center gap-md p-md active:opacity-70"
              >
                <MaterialIcons
                  name="delete-outline"
                  size={22}
                  color={favoriteIds.length === 0 ? colors.outline : colors.onSurfaceVariant}
                />
                <Text
                  className={`flex-1 font-sans text-body-md ${
                    favoriteIds.length === 0 ? 'text-outline' : 'text-on-surface'
                  }`}
                >
                  즐겨찾기 전체 삭제
                </Text>
                <Text className="font-sans text-body-sm text-on-surface-variant">
                  {favoriteIds.length}곳
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 앱 정보 */}
        <View>
          <SectionTitle>앱 정보</SectionTitle>
          <View style={softShadow} className="rounded-lg bg-surface-container-lowest">
            <View className="flex-row items-center gap-md p-md">
              <MaterialIcons name="info-outline" size={22} color={colors.onSurfaceVariant} />
              <Text className="flex-1 font-sans text-body-md text-on-surface">버전</Text>
              <Text className="font-sans text-body-sm text-on-surface-variant">
                {version}
              </Text>
            </View>

            <View className="h-px bg-outline-variant/30" />

            <View className="flex-row items-center gap-md p-md">
              <MaterialIcons name="restaurant" size={22} color={colors.onSurfaceVariant} />
              <Text className="flex-1 font-sans text-body-md text-on-surface">
                등록된 식당
              </Text>
              <Text className="font-sans text-body-sm text-on-surface-variant">
                안암캠퍼스 {diningHalls.length}곳
              </Text>
            </View>

            <View className="h-px bg-outline-variant/30" />

            <View className="gap-xs p-md">
              <View className="flex-row items-center gap-md">
                <MaterialIcons name="update" size={22} color={colors.onSurfaceVariant} />
                <Text className="flex-1 font-sans text-body-md text-on-surface">
                  식단 기준 주
                </Text>
                <Text className="font-sans text-body-sm text-on-surface-variant">
                  {dataSource.weekOf ?? '-'}
                </Text>
              </View>
              <Text className="ml-[38px] font-sans text-body-sm text-outline">
                {dataSource.source}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
