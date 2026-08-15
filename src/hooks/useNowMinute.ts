import { useEffect, useState } from 'react';

/**
 * 분이 바뀔 때마다 갱신되는 현재 시각.
 * 영업 상태가 시간 경계를 넘어가면 화면이 스스로 따라가도록 하기 위한 것이라
 * 초 단위까지 볼 필요는 없다.
 */
export function useNowMinute(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    // 다음 정각(분)에 맞춘 뒤부터 60초 간격으로 돈다.
    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    const timeoutId = setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => setNow(new Date()), 60_000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return now;
}
