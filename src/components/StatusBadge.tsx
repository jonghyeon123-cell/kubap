import { Text, View } from 'react-native';

interface StatusBadgeProps {
  isOpen: boolean;
}

/** 카드 우측 상단 "영업중 / 영업종료" 배지. */
export function StatusBadge({ isOpen }: StatusBadgeProps) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-surface-variant px-2 py-1">
      <View className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-primary' : 'bg-outline'}`} />
      <Text
        className={`font-sans-semibold text-label-md ${
          isOpen ? 'text-on-surface' : 'text-on-surface-variant'
        }`}
      >
        {isOpen ? '영업중' : '영업종료'}
      </Text>
    </View>
  );
}
