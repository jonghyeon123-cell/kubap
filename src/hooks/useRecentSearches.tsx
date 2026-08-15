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

const STORAGE_KEY = '@kubap/recent-searches';
const MAX_ITEMS = 8;

interface RecentSearchesValue {
  recent: string[];
  /** 같은 검색어는 중복 없이 맨 앞으로 올린다. */
  addRecent: (term: string) => void;
  clearRecent: () => void;
}

const RecentSearchesContext = createContext<RecentSearchesValue | null>(null);

/**
 * 검색 화면과 프로필 화면이 같은 목록을 본다. 프로필에서 기록을 지우면
 * 검색 화면도 즉시 비어야 하므로 화면별 훅이 아니라 컨텍스트로 둔다.
 */
export function RecentSearchesProvider({ children }: { children: ReactNode }) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecent(parsed.filter((item): item is string => typeof item === 'string'));
        }
      })
      .catch(() => {
        // 저장된 값이 깨졌으면 빈 목록으로 시작한다.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addRecent = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecent((current) => {
      const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(
        0,
        MAX_ITEMS,
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<RecentSearchesValue>(
    () => ({ recent, addRecent, clearRecent }),
    [recent, addRecent, clearRecent],
  );

  return (
    <RecentSearchesContext.Provider value={value}>
      {children}
    </RecentSearchesContext.Provider>
  );
}

export function useRecentSearches(): RecentSearchesValue {
  const context = useContext(RecentSearchesContext);
  if (!context) {
    throw new Error('useRecentSearches must be used within a RecentSearchesProvider');
  }
  return context;
}
