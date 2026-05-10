import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ShoppingItem } from '@/schemas';

type Props = {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export const ItemRow = ({ item, onToggle, onRemove }: Props) => (
  <View style={styles.row}>
    <Pressable
      style={styles.rowLeft}
      onPress={() => onToggle(item.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.checked }}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>{item.name}</Text>
    </Pressable>
    <Pressable
      style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
      onPress={() => onRemove(item.id)}
      accessibilityLabel={`Remove ${item.name}`}
    >
      <Text style={styles.deleteText}>×</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minHeight: 56,
    paddingLeft: 12,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  itemText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  itemTextChecked: {
    color: '#AAAAAA',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    width: 44,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.5,
  },
  deleteText: {
    fontSize: 22,
    color: '#FF5252',
    lineHeight: 24,
  },
});
