import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, softShadow } from '../theme/tokens';

type IconName = keyof typeof MaterialIcons.glyphMap;

export interface AppBarAction {
  icon: IconName;
  label: string;
  onPress?: () => void;
}

interface TopAppBarProps {
  title: string;
  leading?: AppBarAction;
  actions?: AppBarAction[];
}

function IconButton({ icon, label, onPress }: AppBarAction) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      className="rounded-full p-2 active:bg-surface-container-high"
    >
      <MaterialIcons name={icon} size={24} color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

export function TopAppBar({ title, leading, actions = [] }: TopAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[softShadow, { paddingTop: insets.top }]}
      className="z-50 bg-surface"
    >
      <View className="h-14 flex-row items-center justify-between px-container-padding">
        <View className="w-20 items-start">
          {leading ? <IconButton {...leading} /> : null}
        </View>

        <Text className="font-sans-bold text-headline-md text-primary">{title}</Text>

        <View className="w-20 flex-row items-center justify-end gap-2">
          {actions.map((action) => (
            <IconButton key={action.icon} {...action} />
          ))}
        </View>
      </View>
    </View>
  );
}
