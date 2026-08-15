import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiningHallCard } from '../components/DiningHallCard';
import { FilterChipRow, type FilterChip } from '../components/FilterChipRow';
import { TopAppBar } from '../components/TopAppBar';
import { diningHalls, getHallStatus } from '../data/diningHalls';
import type { DiningHall, HallStatus } from '../data/types';
import { useNowMinute } from '../hooks/useNowMinute';
import { useRootNavigation } from '../navigation/types';
import { TAB_BAR_HEIGHT } from '../theme/tokens';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const now = useNowMinute();
  const navigation = useRootNavigation();

  const [openOnly, setOpenOnly] = useState(false);

  // 분이 바뀔 때만 영업 상태를 다시 계산한다.
  const halls = useMemo<{ hall: DiningHall; status: HallStatus }[]>(
    () =>
      diningHalls
        .map((hall) => ({ hall, status: getHallStatus(hall, now) }))
        .filter(({ status }) => !openOnly || status.isOpen),
    [openOnly, now],
  );

  const chips: FilterChip[] = [
    {
      key: 'open',
      label: '영업중',
      selected: openOnly,
      showDot: true,
      onPress: () => setOpenOnly((value) => !value),
    },
  ];

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar
        title="KU밥"
        leading={{ icon: 'menu', label: '메뉴' }}
        actions={[
          { icon: 'search', label: '검색' },
          { icon: 'bookmark-border', label: '북마크' },
        ]}
      />

      <FlatList
        data={halls}
        keyExtractor={({ hall }) => hall.id}
        // 칩 줄은 화면 끝까지 스크롤돼야 하므로 좌우 여백을 리스트가 아니라
        // 각 아이템이 직접 갖는다.
        ListHeaderComponent={
          <View className="mb-lg">
            <FilterChipRow chips={chips} />
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-container-padding">
            <DiningHallCard
              hall={item.hall}
              status={item.status}
              now={now}
              onPress={() =>
                navigation.navigate('HallDetail', { hallId: item.hall.id })
              }
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View className="h-md" />}
        ListEmptyComponent={
          <View className="items-center px-container-padding py-xl">
            <Text className="mb-xs font-sans-semibold text-headline-sm text-on-surface">
              지금 영업 중인 식당이 없어요
            </Text>
            <Text className="font-sans text-body-sm text-on-surface-variant">
              필터를 끄면 전체 식당을 볼 수 있어요
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
