import { useCallback, useEffect, useState } from 'react';
import { loadItems, saveItems } from './storage';
import { ShoppingItem } from './types';

type LastRemoved = { item: ShoppingItem; index: number };

const MAX_REMOVED_STACK = 10;

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Most recent removal last. Capped to the last MAX_REMOVED_STACK
  // deletions — older ones simply become permanently un-restorable.
  const [removedStack, setRemovedStack] = useState<LastRemoved[]>([]);

  useEffect(() => {
    loadItems().then((stored) => {
      setItems(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveItems(items);
  }, [items, loaded]);

  const addItem = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, name: trimmed }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    // Captures the item and its index inside the functional update so it
    // always reflects the latest items, without needing `items` as a dep.
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      setRemovedStack((stack) =>
        [...stack, { item: prev[index], index }].slice(-MAX_REMOVED_STACK),
      );
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const restoreLastRemoved = useCallback(() => {
    setRemovedStack((stack) => {
      if (stack.length === 0) return stack;
      const pending = stack[stack.length - 1];
      setItems((prev) => {
        const index = Math.min(pending.index, prev.length);
        return [...prev.slice(0, index), pending.item, ...prev.slice(index)];
      });
      return stack.slice(0, -1);
    });
  }, []);

  const updateItem = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name: trimmed } : item)));
  }, []);

  const reorderItem = useCallback((id: string, toIndex: number) => {
    setItems((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === id);
      if (fromIndex === -1) return prev;
      const clampedTo = Math.max(0, Math.min(toIndex, prev.length - 1));
      if (clampedTo === fromIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(clampedTo, 0, moved);
      return next;
    });
  }, []);

  // Callers only ever need "the current thing restore would bring back" —
  // exposing just the top of the stack keeps that surface unchanged even
  // though multiple removals can now be chained through.
  const lastRemoved = removedStack.length > 0 ? removedStack[removedStack.length - 1] : null;

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    reorderItem,
    lastRemoved,
    restoreLastRemoved,
    loaded,
  };
}
