import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { bundledData } from '../data/diningHalls';
import type { DiningData, DiningHall } from '../data/types';

/**
 * GitHub Actions가 매주 월요일 갱신해 Pages에 올리는 식단 파일.
 * scripts/fetch-menus.mjs → data/dining-halls.json → build/dining-halls.json 경로로 배포된다.
 */
const REMOTE_URL = 'https://jonghyeon123-cell.github.io/kubap/dining-halls.json';

const CACHE_KEY = '@kubap/dining-data';
const REQUEST_TIMEOUT_MS = 10_000;

/** 어디서 온 데이터인지 — 화면에 신선도를 정직하게 드러내기 위해 구분한다. */
export type DataOrigin = 'bundled' | 'cache' | 'remote';

interface CachedPayload {
  data: DiningData;
  syncedAt: string;
}

interface DiningDataValue {
  data: DiningData;
  diningHalls: DiningHall[];
  origin: DataOrigin;
  /** 원격에서 마지막으로 성공적으로 받아온 시각 (ISO). 한 번도 없으면 null. */
  syncedAt: string | null;
  isRefreshing: boolean;
  /** 마지막 갱신 시도가 실패했으면 사유. */
  error: string | null;
  refresh: () => Promise<void>;
}

const DiningDataContext = createContext<DiningDataValue | null>(null);

/** 받아온 JSON이 우리가 기대하는 모양인지 최소한으로 검증한다. */
function isDiningData(value: unknown): value is DiningData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DiningData>;

  if (!Array.isArray(candidate.diningHalls) || candidate.diningHalls.length === 0) {
    return false;
  }

  return candidate.diningHalls.every((hall) => {
    if (!hall || typeof hall !== 'object') return false;
    const h = hall as Partial<DiningHall>;
    return (
      typeof h.id === 'string' &&
      typeof h.name === 'string' &&
      typeof h.hours === 'object' &&
      h.hours !== null &&
      typeof h.weeklyMenus === 'object' &&
      h.weeklyMenus !== null
    );
  });
}

export function DiningDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DiningData>(bundledData);
  const [origin, setOrigin] = useState<DataOrigin>('bundled');
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!mounted.current) return;
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(REMOTE_URL, {
        // 학교 식단은 주 1회만 바뀌지만, 캐시된 응답을 잡고 있으면 갱신이 늦어진다.
        cache: 'no-cache',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload: unknown = await response.json();
      if (!isDiningData(payload)) throw new Error('형식이 올바르지 않은 응답');

      const now = new Date().toISOString();
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: payload, syncedAt: now } satisfies CachedPayload),
      ).catch(() => {});

      if (!mounted.current) return;
      setData(payload);
      setOrigin('remote');
      setSyncedAt(now);
    } catch (cause) {
      if (!mounted.current) return;
      // 실패해도 화면은 캐시나 번들 데이터로 계속 돌아간다.
      setError(cause instanceof Error ? cause.message : '알 수 없는 오류');
    } finally {
      if (mounted.current) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // 캐시를 먼저 띄워 첫 화면을 비우지 않고, 곧바로 원격 갱신을 시도한다.
    AsyncStorage.getItem(CACHE_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        const parsed: unknown = JSON.parse(stored);
        const cached = parsed as Partial<CachedPayload>;
        if (isDiningData(cached?.data)) {
          setData(cached.data);
          setOrigin('cache');
          setSyncedAt(typeof cached.syncedAt === 'string' ? cached.syncedAt : null);
        }
      })
      .catch(() => {
        // 캐시가 깨졌으면 번들 데이터로 시작한다.
      })
      .finally(() => {
        if (!cancelled) void refresh();
      });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const value = useMemo<DiningDataValue>(
    () => ({
      data,
      diningHalls: data.diningHalls,
      origin,
      syncedAt,
      isRefreshing,
      error,
      refresh,
    }),
    [data, origin, syncedAt, isRefreshing, error, refresh],
  );

  return <DiningDataContext.Provider value={value}>{children}</DiningDataContext.Provider>;
}

export function useDiningData(): DiningDataValue {
  const context = useContext(DiningDataContext);
  if (!context) {
    throw new Error('useDiningData must be used within a DiningDataProvider');
  }
  return context;
}
