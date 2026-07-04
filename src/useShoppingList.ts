import { useCallback, useEffect, useState } from 'react';
import { loadItems, saveItems } from './storage';
import { ShoppingItem } from './types';

type LastRemoved = { item: ShoppingItem; index: number };

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastRemoved, setLastRemoved] = useState<LastRemoved | null>(null);

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
      setLastRemoved({ item: prev[index], index });
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const restoreLastRemoved = useCallback(() => {
    setLastRemoved((pending) => {
      if (!pending) return pending;
      setItems((prev) => {
        const index = Math.min(pending.index, prev.length);
        return [...prev.slice(0, index), pending.item, ...prev.slice(index)];
      });
      return null;
    });
  }, []);

  const updateItem = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name: trimmed } : item)));
  }, []);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    lastRemoved,
    restoreLastRemoved,
    loaded,
  };
}
