import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useShoppingList } from './useShoppingList';

beforeEach(async () => {
  await AsyncStorage.clear();
});

const setup = async () => {
  const { result } = renderHook(() => useShoppingList());
  await act(async () => {}); // flush initial load effect
  return result;
};

describe('useShoppingList', () => {
  it('starts with an empty list', async () => {
    const result = await setup();
    expect(result.current.items).toEqual([]);
  });

  it('addItem prepends a new unchecked item', async () => {
    const result = await setup();
    act(() => { result.current.addItem('Milk'); });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ name: 'Milk', checked: false });
  });

  it('addItem ignores blank strings', async () => {
    const result = await setup();
    act(() => { result.current.addItem('   '); });
    expect(result.current.items).toHaveLength(0);
  });

  it('toggleItem flips the checked state', async () => {
    const result = await setup();
    act(() => { result.current.addItem('Eggs'); });
    const id = result.current.items[0].id;
    act(() => { result.current.toggleItem(id); });
    expect(result.current.items.find(i => i.id === id)?.checked).toBe(true);
  });

  it('removeItem deletes the item by id', async () => {
    const result = await setup();
    act(() => { result.current.addItem('Bread'); });
    const id = result.current.items[0].id;
    act(() => { result.current.removeItem(id); });
    expect(result.current.items).toHaveLength(0);
  });

  it('clearChecked removes only checked items', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
      result.current.addItem('Eggs');
    });
    const firstId = result.current.items[0].id;
    act(() => { result.current.toggleItem(firstId); });
    act(() => { result.current.clearChecked(); });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items.every(i => !i.checked)).toBe(true);
  });

  it('sorts checked items to the bottom', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
      result.current.addItem('Eggs'); // prepended — Eggs is index 0
    });
    const eggsId = result.current.items[0].id;
    act(() => { result.current.toggleItem(eggsId); });
    const last = result.current.items[result.current.items.length - 1];
    expect(last.checked).toBe(true);
  });
});
