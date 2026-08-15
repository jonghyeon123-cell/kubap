import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, type NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Home: undefined;
  DiningHalls: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  /** 탭 사이 이동도 스택에서 지정할 수 있게 중첩 파라미터를 연다. */
  Tabs: NavigatorScreenParams<RootTabParamList>;
  HallDetail: { hallId: string };
};

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;

/** 탭 안쪽 화면에서도 상세 화면으로 push할 수 있게 타입을 붙인 useNavigation. */
export function useRootNavigation(): RootStackNavigation {
  return useNavigation<RootStackNavigation>();
}
