import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddItemBar } from '@/components/AddItemBar';
import { ItemRow } from '@/components/ItemRow';
import { useShoppingList } from '@/useShoppingList';

export default function HomeScreen() {
  const { items, addItem, toggleItem, removeItem, clearChecked } = useShoppingList();
  const checkedCount = items.filter(i => i.checked).length;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.flex}>
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
  list: {
    flex: 1,
    marginHorizontal: 16,
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
