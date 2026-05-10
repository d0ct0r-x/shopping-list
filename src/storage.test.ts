import { beforeEach, describe, expect, it } from 'vitest';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadItems, saveItems } from './storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('loadItems', () => {
  it('returns empty array when nothing is stored', async () => {
    expect(await loadItems()).toEqual([]);
  });

  it('returns stored items', async () => {
    const items = [{ id: '1', name: 'Milk', checked: false }];
    await saveItems(items);
    expect(await loadItems()).toEqual(items);
  });

  it('returns empty array when stored data fails Zod validation', async () => {
    await AsyncStorage.setItem('shopping_list_v1', JSON.stringify([{ invalid: true }]));
    expect(await loadItems()).toEqual([]);
  });

  it('returns empty array when stored data is not valid JSON', async () => {
    await AsyncStorage.setItem('shopping_list_v1', 'not-json{{');
    expect(await loadItems()).toEqual([]);
  });
});

describe('saveItems', () => {
  it('persists items that survive a reload', async () => {
    const items = [
      { id: '1', name: 'Eggs', checked: false },
      { id: '2', name: 'Bread', checked: true },
    ];
    await saveItems(items);
    expect(await loadItems()).toEqual(items);
  });

  it('overwrites previously saved items', async () => {
    await saveItems([{ id: '1', name: 'Milk', checked: false }]);
    await saveItems([{ id: '2', name: 'Butter', checked: false }]);
    expect(await loadItems()).toEqual([{ id: '2', name: 'Butter', checked: false }]);
  });
});
