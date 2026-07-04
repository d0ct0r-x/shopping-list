import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingItemSchema } from './schemas';
import type { ShoppingItem } from './schemas';

const KEY = 'shopping_list_v1';

export const loadItems = async (): Promise<ShoppingItem[]> => {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const result = ShoppingItemSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
};

export const saveItems = async (items: ShoppingItem[]): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
};
