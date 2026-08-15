import { Pressable, ScrollView, Text, View } from 'react-native';

export interface FilterChip {
  key: string;
  label: string;
  selected: boolean;
  /** true면 "영업중" 칩처럼 상태 점이 붙는 아웃라인 스타일로 그린다. */
  showDot?: boolean;
  onPress: () => void;
}

interface FilterChipRowProps {
  chips: FilterChip[];
}

/**
 * 홈 상단 필터 줄. 캠퍼스 단일 선택 그룹과 "영업중" 토글이 한 줄에 섞이므로
 * 각 칩이 자기 선택 상태와 핸들러를 들고 온다.
 */
export function FilterChipRow({ chips }: FilterChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row gap-sm px-container-padding py-sm"
    >
      {chips.map((chip) => {
        // 채움 칩은 primary-container(버튼/배지 컬러)로 선택을 표현하고,
        // 점 칩은 채우는 대신 primary 테두리 + primary 텍스트를 쓴다.
        const containerClass = chip.showDot
          ? chip.selected
            ? 'border border-primary bg-primary-container'
            : 'border border-primary bg-surface-variant'
          : chip.selected
            ? 'bg-primary-container'
            : 'bg-surface-variant';

        const textClass = chip.showDot
          ? chip.selected
            ? 'text-on-primary'
            : 'text-primary'
          : chip.selected
            ? 'text-on-primary'
            : 'text-on-surface-variant';

        return (
          <Pressable
            key={chip.key}
            accessibilityRole="button"
            accessibilityState={{ selected: chip.selected }}
            onPress={chip.onPress}
            className={`shrink-0 flex-row items-center gap-1 rounded-full px-4 py-2 active:opacity-80 ${containerClass}`}
          >
            {chip.showDot ? (
              <View
                className={`h-2 w-2 rounded-full ${
                  chip.selected ? 'bg-on-primary' : 'bg-primary'
                }`}
              />
            ) : null}
            <Text className={`font-sans-semibold text-label-md ${textClass}`}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
