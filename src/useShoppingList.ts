import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingItem } from './types';
import { loadItems, saveItems } from './storage';

export const REMOVAL_DELAY_MS = 4000;

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    loadItems().then(stored => {
      setItems(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveItems(items);
  }, [items, loaded]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const addItem = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems(prev => [
      { id: `${Date.now()}-${Math.random()}`, name: trimmed, checked: false },
      ...prev,
    ]);
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }, []);

  const updateItem = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems(prev => prev.map(item => (item.id === id ? { ...item, name: trimmed } : item)));
  }, []);

  const commitRemoval = useCallback((id: string) => {
    timers.current.delete(id);
    setItems(prev => prev.filter(item => item.id !== id));
    setPendingIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const removeItem = useCallback(
    (id: string) => {
      setPendingIds(prev => new Set(prev).add(id));
      const timer = setTimeout(() => commitRemoval(id), REMOVAL_DELAY_MS);
      timers.current.set(id, timer);
    },
    [commitRemoval]
  );

  const undoRemove = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setPendingIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearChecked = useCallback(() => {
    items.filter(item => item.checked && !pendingIds.has(item.id)).forEach(item => removeItem(item.id));
  }, [items, pendingIds, removeItem]);

  const sortedItems = useMemo(
    () => [...items.filter(i => !i.checked), ...items.filter(i => i.checked)],
    [items]
  );

  return {
    items: sortedItems,
    pendingIds,
    addItem,
    toggleItem,
    updateItem,
    removeItem,
    undoRemove,
    clearChecked,
    loaded,
  };
}
