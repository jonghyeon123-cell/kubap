import { MaterialIcons } from '@expo/vector-icons';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiningHallCard } from '../components/DiningHallCard';
import { TopAppBar } from '../components/TopAppBar';
import { getHallStatus } from '../data/diningHalls';
import { useDiningData } from '../hooks/useDiningData';
import { useFavorites } from '../hooks/useFavorites';
import { useNowMinute } from '../hooks/useNowMinute';
import { useRootNavigation } from '../navigation/types';
import { colors, TAB_BAR_HEIGHT } from '../theme/tokens';

interface FavoritesScreenProps {
  onBrowse: () => void;
}

function EmptyState({ onBrowse }: FavoritesScreenProps) {
  return (
    <View className="flex-1 items-center justify-center gap-md px-container-padding">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-surface-container">
        <MaterialIcons name="heart-broken" size={36} color={colors.onSurfaceVariant} />
      </View>
      <View className="items-center gap-xs">
        <Text className="font-sans-semibold text-headline-sm text-on-surface">
          즐겨찾는 식당이 없어요
        </Text>
        <Text className="text-center font-sans text-body-sm text-on-surface-variant">
          자주 가는 식당을 즐겨찾기에 추가해보세요
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onBrowse}
        className="mt-sm h-14 items-center justify-center rounded-lg bg-primary-container px-xl active:scale-[0.98]"
      >
        <Text className="font-sans-bold text-body-md text-on-primary">식당 둘러보기</Text>
      </Pressable>
    </View>
  );
}

export function FavoritesScreen({ onBrowse }: FavoritesScreenProps) {
  const insets = useSafeAreaInsets();
  const now = useNowMinute();
  const navigation = useRootNavigation();
  const { diningHalls } = useDiningData();
  const { favoriteIds, isLoading } = useFavorites();

  const saved = diningHalls.filter((hall) => favoriteIds.includes(hall.id));

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title="KU밥" leading={{ icon: 'menu', label: '메뉴' }} />

      {isLoading ? null : saved.length === 0 ? (
        <EmptyState onBrowse={onBrowse} />
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(hall) => hall.id}
          ListHeaderComponent={
            <View className="mb-md flex-row items-baseline justify-between px-container-padding">
              <Text className="font-sans-semibold text-headline-sm text-on-surface">
                저장한 식당
              </Text>
              <Text className="font-sans-semibold text-label-md text-on-surface-variant">
                {saved.length}곳
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="px-container-padding">
              <DiningHallCard
                hall={item}
                status={getHallStatus(item, now)}
                now={now}
                onPress={() => navigation.navigate('HallDetail', { hallId: item.id })}
              />
            </View>
          )}
          ItemSeparatorComponent={() => <View className="h-md" />}
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
