import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGameStore } from '../store/useGameStore';

const TICK_INTERVAL_MS = 5000;
const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

export function useGameLoop() {
  const advanceGameTick = useGameStore((state) => state.advanceGameTick);
  const lastBackground = useRef<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      advanceGameTick();
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [advanceGameTick]);

  useEffect(() => {
    const handleStateChange = (status: AppStateStatus) => {
      if (status === 'active') {
        const now = Date.now();
        const offlineSeconds = Math.min((now - lastBackground.current) / 1000, MAX_OFFLINE_SECONDS);
        const offlineTicks = Math.floor(offlineSeconds / (TICK_INTERVAL_MS / 1000));
        for (let i = 0; i < offlineTicks; i += 1) {
          advanceGameTick();
        }
      } else {
        lastBackground.current = Date.now();
      }
    };

    const subscription = AppState.addEventListener('change', handleStateChange);
    return () => subscription.remove();
  }, [advanceGameTick]);
}
