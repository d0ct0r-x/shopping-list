import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingItem } from './types';

const KEY = 'shopping_list_v1';

export async function loadItems(): Promise<ShoppingItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ShoppingItem[];
  } catch {
    return [];
  }
}

export async function saveItems(items: ShoppingItem[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}
