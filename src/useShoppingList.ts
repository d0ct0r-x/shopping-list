import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingItem } from './types';
import { loadItems, saveItems } from './storage';

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadItems().then(stored => {
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

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearChecked = useCallback(() => {
    setItems(prev => prev.filter(item => !item.checked));
  }, []);

  const sortedItems = useMemo(
    () => [...items.filter(i => !i.checked), ...items.filter(i => i.checked)],
    [items]
  );

  return { items: sortedItems, addItem, toggleItem, removeItem, clearChecked, loaded };
}
