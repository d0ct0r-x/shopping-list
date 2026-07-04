import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { useThemePreference } from '@/useThemePreference';
import '../global.css';

export default function RootLayout() {
  useThemePreference();
  const { colorScheme } = useColorScheme();
  const theme = useTheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background);
  }, [theme.background]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.foreground,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
