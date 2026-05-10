import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState, useRef } from 'react';
import { useShoppingList } from './src/useShoppingList';
import { ShoppingItem } from './src/types';

function AddItemBar({ onAdd }: { onAdd: (name: string) => void }) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  function submit() {
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  }

  return (
    <View style={styles.addBar}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Add an item…"
        placeholderTextColor="#AAAAAA"
        returnKeyType="done"
        onSubmitEditing={submit}
        blurOnSubmit={false}
      />
      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        onPress={submit}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>
  );
}

function ItemRow({
  item,
  onToggle,
  onRemove,
}: {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
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
        <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
          {item.name}
        </Text>
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
}

export default function App() {
  const { items, addItem, toggleItem, removeItem, clearChecked } = useShoppingList();
  const checkedCount = items.filter(i => i.checked).length;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.flex}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
        <View style={styles.header}>
          <Text style={styles.headerText}>Shopping List</Text>
        </View>
        <AddItemBar onAdd={addItem} />
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ItemRow item={item} onToggle={toggleItem} onRemove={removeItem} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={items.length === 0 && styles.emptyContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Your list is empty.{'\n'}Add something above.</Text>
          }
          keyboardShouldPersistTaps="handled"
          style={styles.list}
        />
        {checkedCount > 0 && (
          <Pressable
            style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
            onPress={clearChecked}
          >
            <Text style={styles.clearButtonText}>Remove checked ({checkedCount})</Text>
          </Pressable>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  addButtonPressed: {
    opacity: 0.75,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    marginHorizontal: 16,
  },
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
  separator: {
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 16,
    lineHeight: 24,
  },
  clearButton: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  clearButtonPressed: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FF5252',
  },
  clearButtonText: {
    color: '#FF5252',
    fontSize: 15,
    fontWeight: '600',
  },
});
