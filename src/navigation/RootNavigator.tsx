import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getHallById } from '../data/diningHalls';
import { useDiningData } from '../hooks/useDiningData';
import { DetailScreen } from '../screens/DetailScreen';
import { DiningHallsScreen } from '../screens/DiningHallsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, fonts, navShadow, TAB_BAR_HEIGHT } from '../theme/tokens';

import type { RootStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.surface,
    card: colors.surface,
    text: colors.onSurface,
    border: colors.outlineVariant,
  },
};

/** 배경 위로 콘텐츠가 지나가는 글래스모피즘 바 (DESIGN.md > Navigation). */
function TabBarBackground() {
  return (
    <View className="overflow-hidden rounded-t-xl" style={StyleSheet.absoluteFill}>
      <BlurView tint="light" intensity={40} style={StyleSheet.absoluteFill} />
      <View
        style={StyleSheet.absoluteFill}
        className="border-t border-outline-variant/30 bg-surface/90"
      />
    </View>
  );
}

const TAB_ICONS: Record<keyof RootTabParamList, keyof typeof MaterialIcons.glyphMap> = {
  Home: 'home',
  DiningHalls: 'restaurant',
  Favorites: 'favorite',
  Profile: 'person',
};

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: 'absolute',
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          ...navShadow,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 12,
          lineHeight: 16,
          letterSpacing: 0.6,
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tab.Screen
        name="DiningHalls"
        component={DiningHallsScreen}
        options={{ title: '식당' }}
      />
      <Tab.Screen name="Favorites" options={{ title: '관심' }}>
        {({ navigation }) => (
          <FavoritesScreen onBrowse={() => navigation.navigate('DiningHalls')} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '프로필' }} />
    </Tab.Navigator>
  );
}

function HallDetailRoute({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'HallDetail'>) {
  const { diningHalls } = useDiningData();
  const hall = getHallById(diningHalls, route.params.hallId);

  // 저장된 즐겨찾기가 데이터에서 사라진 경우에도 화면이 깨지지 않게 한다.
  if (!hall) {
    return (
      <View className="flex-1 items-center justify-center gap-xs bg-surface px-container-padding">
        <Text className="font-sans-semibold text-headline-sm text-on-surface">
          식당을 찾을 수 없어요
        </Text>
        <Text className="font-sans text-body-sm text-on-surface-variant">
          목록에서 다시 선택해주세요
        </Text>
      </View>
    );
  }

  return <DetailScreen hall={hall} onBack={() => navigation.goBack()} />;
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="HallDetail" component={HallDetailRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
