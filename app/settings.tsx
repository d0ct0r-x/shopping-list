import { Moon, Sun, SunMoon, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import type { ThemePreference } from '@/schemas';
import { useTheme } from '@/theme';
import { useThemePreference } from '@/useThemePreference';

const OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: SunMoon },
];

const FADE_DURATION_MS = 450;

export default function SettingsScreen() {
  const { preference, setPreference } = useThemePreference();
  const theme = useTheme();
  const [overlayColor, setOverlayColor] = useState(theme.background);
  const overlayOpacity = useSharedValue(0);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  const handleSelect = (value: ThemePreference) => {
    if (value === preference) return;
    setOverlayColor(theme.background);
    overlayOpacity.value = 1;
    setPreference(value);
    overlayOpacity.value = withTiming(0, {
      duration: FADE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-background">
      <View className="px-4 pt-4">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Appearance
        </Text>
        <View className="flex-row bg-surface rounded-xl border border-separator p-1">
          {OPTIONS.map(option => {
            const selected = option.value === preference;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-lg ${selected ? 'bg-primary' : ''}`}
              >
                <Icon
                  as={option.icon}
                  size={14}
                  className={selected ? 'text-primary-foreground' : 'text-muted-foreground'}
                />
                <Text
                  className={
                    selected
                      ? 'text-primary-foreground text-[13px] font-semibold'
                      : 'text-muted-foreground text-[13px] font-medium'
                  }
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: overlayColor },
          overlayStyle,
        ]}
      />
    </SafeAreaView>
  );
}
