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
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-3 pb-2">
          <Text className="text-[28px] font-bold text-foreground">Shopping List</Text>
        </View>
        <AddItemBar onAdd={addItem} />
        <FlatList
          className="flex-1 mx-4"
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ItemRow item={item} onToggle={toggleItem} onRemove={removeItem} />
          )}
          ItemSeparatorComponent={() => <View className="h-px bg-separator" />}
          contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <Text className="text-center text-muted-foreground text-base leading-6">
              Your list is empty.{'\n'}Add something above.
            </Text>
          }
          keyboardShouldPersistTaps="handled"
        />
        {checkedCount > 0 && (
          <Pressable
            className="m-4 py-3.5 rounded-xl bg-surface items-center border border-separator active:bg-red-50 active:border-danger"
            onPress={clearChecked}
          >
            <Text className="text-danger text-[15px] font-semibold">
              Remove checked ({checkedCount})
            </Text>
          </Pressable>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
