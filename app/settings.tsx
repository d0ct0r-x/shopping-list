import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ThemePreference } from '@/schemas';
import { useThemePreference } from '@/useThemePreference';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export default function SettingsScreen() {
  const { preference, setPreference } = useThemePreference();

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
                onPress={() => setPreference(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`flex-1 items-center py-2 rounded-lg ${selected ? 'bg-primary' : ''}`}
              >
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
    </SafeAreaView>
  );
}
