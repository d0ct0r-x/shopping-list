import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import { type ThemePreference, ThemePreferenceSchema } from './schemas';

const KEY = 'theme_preference_v1';

export function useThemePreference() {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((stored) => {
      const result = ThemePreferenceSchema.safeParse(stored);
      const initial = result.success ? result.data : 'system';
      setPreferenceState(initial);
      colorScheme.set(initial);
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    colorScheme.set(next);
    AsyncStorage.setItem(KEY, next);
  }, []);

  return { preference, setPreference };
}
