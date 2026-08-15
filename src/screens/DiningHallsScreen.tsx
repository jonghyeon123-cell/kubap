import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchResultCard } from '../components/SearchResultCard';
import { TopAppBar } from '../components/TopAppBar';
import { searchHalls } from '../data/diningHalls';
import { useDiningData } from '../hooks/useDiningData';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useRootNavigation } from '../navigation/types';
import { colors, softShadow, TAB_BAR_HEIGHT } from '../theme/tokens';

export function DiningHallsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useRootNavigation();
  const { diningHalls } = useDiningData();
  const { recent, addRecent, clearRecent } = useRecentSearches();

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const trimmed = query.trim();
  const results = useMemo(
    () => searchHalls(diningHalls, trimmed),
    [diningHalls, trimmed],
  );

  const openHall = (hallId: string) => {
    // 결과를 실제로 열었을 때만 검색어를 남긴다.
    if (trimmed) addRecent(trimmed);
    navigation.navigate('HallDetail', { hallId });
  };

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar
        title="KU밥"
        leading={{ icon: 'menu', label: '메뉴' }}
        actions={[{ icon: 'notifications-none', label: '알림' }]}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
        }}
      >
        {/* 검색 입력 */}
        <View style={softShadow} className="relative mb-xl justify-center">
          <View className="absolute left-4 z-10">
            <MaterialIcons name="search" size={22} color={colors.onSurfaceVariant} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={() => addRecent(trimmed)}
            placeholder="식당 이름이나 메뉴로 검색"
            placeholderTextColor={colors.outline}
            returnKeyType="search"
            className={`w-full rounded-md border bg-surface-container-lowest py-4 pl-12 pr-4 font-sans text-body-lg text-on-surface ${
              isFocused ? 'border-primary-container' : 'border-outline-variant'
            }`}
          />
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="검색어 지우기"
              onPress={() => setQuery('')}
              hitSlop={8}
              className="absolute right-4 z-10"
            >
              <MaterialIcons name="cancel" size={20} color={colors.outline} />
            </Pressable>
          ) : null}
        </View>

        {trimmed ? (
          /* 검색 결과 */
          <View>
            <Text className="mb-md font-sans-semibold text-headline-sm text-on-surface">
              검색 결과 {results.length > 0 ? `${results.length}곳` : ''}
            </Text>

            {results.length > 0 ? (
              <View className="gap-sm">
                {results.map(({ hall, matchedMenu }) => (
                  <SearchResultCard
                    key={hall.id}
                    hall={hall}
                    matchedMenu={matchedMenu}
                    onPress={() => openHall(hall.id)}
                  />
                ))}
              </View>
            ) : (
              <View className="items-center gap-xs rounded-lg bg-surface-container-low p-xl">
                <Text className="font-sans-semibold text-body-md text-on-surface">
                  “{trimmed}” 검색 결과가 없어요
                </Text>
                <Text className="text-center font-sans text-body-sm text-on-surface-variant">
                  식당 이름이나 메뉴 이름으로 다시 검색해보세요
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* 최근 검색어 */}
            {recent.length > 0 ? (
              <View className="mb-xl">
                <View className="mb-md flex-row items-center justify-between">
                  <Text className="font-sans-semibold text-headline-sm text-on-surface">
                    최근 검색어
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={clearRecent}
                    hitSlop={8}
                    className="active:opacity-60"
                  >
                    <Text className="font-sans-semibold text-label-md text-on-surface-variant">
                      전체 삭제
                    </Text>
                  </Pressable>
                </View>

                <View className="flex-row flex-wrap gap-sm">
                  {recent.map((term) => (
                    <Pressable
                      key={term}
                      accessibilityRole="button"
                      onPress={() => setQuery(term)}
                      className="rounded-full border border-outline-variant/30 bg-surface-container px-4 py-2 active:opacity-80"
                    >
                      <Text className="font-sans-semibold text-label-md text-on-surface-variant">
                        {term}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {/* 추천 식당 */}
            <View>
              <Text className="mb-md font-sans-semibold text-headline-sm text-on-surface">
                추천 식당
              </Text>
              <View className="gap-sm">
                {diningHalls.map((hall) => (
                  <SearchResultCard
                    key={hall.id}
                    hall={hall}
                    onPress={() => navigation.navigate('HallDetail', { hallId: hall.id })}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
