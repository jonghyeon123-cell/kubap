import './global.css';

import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_600SemiBold,
  NotoSansKR_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans-kr';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DiningDataProvider } from './src/hooks/useDiningData';
import { FavoritesProvider } from './src/hooks/useFavorites';
import { RecentSearchesProvider } from './src/hooks/useRecentSearches';
import { RootNavigator } from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_600SemiBold,
    NotoSansKR_700Bold,
  });

  useEffect(() => {
    // 폰트가 실패해도 시스템 폰트로 떨어뜨리고 앱은 띄운다.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <DiningDataProvider>
        <FavoritesProvider>
          <RecentSearchesProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </RecentSearchesProvider>
        </FavoritesProvider>
      </DiningDataProvider>
    </SafeAreaProvider>
  );
}
