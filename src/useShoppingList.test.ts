import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
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

  it('addItem appends a new item', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ name: 'Milk' });
  });

  it('addItem ignores blank strings', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('   ');
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('addItem adds new items after existing ones', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
      result.current.addItem('Eggs');
    });
    expect(result.current.items.map((i) => i.name)).toEqual(['Milk', 'Eggs']);
  });

  it('removeItem removes the item with the given id', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
      result.current.addItem('Eggs');
    });
    const milkId = result.current.items[0].id;
    act(() => {
      result.current.removeItem(milkId);
    });
    expect(result.current.items.map((i) => i.name)).toEqual(['Eggs']);
  });

  it('updateItem renames the item with the given id', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
    });
    const id = result.current.items[0].id;
    act(() => {
      result.current.updateItem(id, 'Oat milk');
    });
    expect(result.current.items[0].name).toBe('Oat milk');
  });

  it('updateItem ignores a blank name', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
    });
    const id = result.current.items[0].id;
    act(() => {
      result.current.updateItem(id, '   ');
    });
    expect(result.current.items[0].name).toBe('Milk');
  });

  it('restoreLastRemoved reinserts the last removed item at its original index', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
      result.current.addItem('Eggs');
      result.current.addItem('Bread');
    });
    const eggsId = result.current.items[1].id;
    act(() => {
      result.current.removeItem(eggsId);
    });
    expect(result.current.items.map((i) => i.name)).toEqual(['Milk', 'Bread']);
    act(() => {
      result.current.restoreLastRemoved();
    });
    expect(result.current.items.map((i) => i.name)).toEqual(['Milk', 'Eggs', 'Bread']);
  });

  it('lastRemoved is null when there is nothing to restore', async () => {
    const result = await setup();
    expect(result.current.lastRemoved).toBeNull();
  });

  it('restoreLastRemoved is a no-op when nothing has been removed', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
    });
    act(() => {
      result.current.restoreLastRemoved();
    });
    expect(result.current.items.map((i) => i.name)).toEqual(['Milk']);
  });

  it('restoreLastRemoved only keeps the single most recent removal', async () => {
    const result = await setup();
    act(() => {
      result.current.addItem('Milk');
      result.current.addItem('Eggs');
    });
    const milkId = result.current.items[0].id;
    const eggsId = result.current.items[1].id;
    act(() => {
      result.current.removeItem(milkId);
      result.current.removeItem(eggsId);
    });
    act(() => {
      result.current.restoreLastRemoved();
    });
    expect(result.current.items.map((i) => i.name)).toEqual(['Eggs']);
  });
});
