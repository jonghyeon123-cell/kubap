import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = '@kubap/favorites';

interface FavoritesValue {
  /** 즐겨찾기한 식당 id 집합. */
  favoriteIds: string[];
  /** AsyncStorage에서 첫 로드가 끝나기 전에는 true. */
  isLoading: boolean;
  isFavorite: (hallId: string) => boolean;
  toggleFavorite: (hallId: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavoriteIds(parsed.filter((id): id is string => typeof id === 'string'));
        }
      })
      .catch(() => {
        // 저장된 값이 깨졌거나 읽을 수 없으면 빈 목록으로 시작한다.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFavorite = useCallback((hallId: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(hallId)
        ? current.filter((id) => id !== hallId)
        : [...current, hallId];

      // 낙관적 업데이트: 화면은 즉시 바뀌고 저장은 뒤따른다.
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<FavoritesValue>(
    () => ({
      favoriteIds,
      isLoading,
      isFavorite: (hallId: string) => favoriteIds.includes(hallId),
      toggleFavorite,
      clearFavorites,
    }),
    [favoriteIds, isLoading, toggleFavorite, clearFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
