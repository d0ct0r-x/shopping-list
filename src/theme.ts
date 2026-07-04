import { useColorScheme } from 'nativewind';

export type Colors = {
  background: string;
  surface: string;
  primary: string;
  foreground: string;
  mutedForeground: string;
  separator: string;
};

const light: Colors = {
  background: '#F9F9F9',
  surface: '#FFFFFF',
  primary: '#4CAF50',
  foreground: '#1A1A1A',
  mutedForeground: '#AAAAAA',
  separator: '#E8E8E8',
};

const dark: Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#66BB6A',
  foreground: '#FFFFFF',
  mutedForeground: '#9E9E9E',
  separator: '#2C2C2C',
};

export const useTheme = (): Colors => {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? dark : light;
};
