import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { menuTitle } from '../data/diningHalls';
import type { DiningHall, MenuItem } from '../data/types';
import { colors, softShadow } from '../theme/tokens';

interface SearchResultCardProps {
  hall: DiningHall;
  /** 메뉴 때문에 걸린 결과면 그 메뉴를 보여줘 검색 근거를 드러낸다. */
  matchedMenu?: MenuItem | null;
  onPress: () => void;
}

export function SearchResultCard({
  hall,
  matchedMenu = null,
  onPress,
}: SearchResultCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hall.name}
      onPress={onPress}
      style={softShadow}
      className="flex-row items-center justify-between gap-md rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-md active:scale-[0.98]"
    >
      <View className="flex-1">
        <Text className="font-sans-semibold text-body-lg text-on-surface">{hall.name}</Text>

        <View className="mt-1 flex-row items-center gap-1">
          <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
          <Text className="flex-1 font-sans text-body-sm text-on-surface-variant">
            {hall.building}
          </Text>
        </View>

        {matchedMenu ? (
          <View className="mt-sm flex-row items-center gap-1">
            <MaterialIcons name="restaurant-menu" size={16} color={colors.primary} />
            <Text className="flex-1 font-sans text-body-sm text-primary">
              {menuTitle(matchedMenu)}
            </Text>
          </View>
        ) : null}
      </View>

    </Pressable>
  );
}
