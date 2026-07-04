import { useEffect, useRef } from 'react';
import {
  FlatList,
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddItemBar } from '@/components/AddItemBar';
import { ItemRow } from '@/components/ItemRow';
import { Icon } from '@/components/ui/icon';
import { useShoppingList } from '@/useShoppingList';

const INITIAL_BAR_HEIGHT_ESTIMATE = 88;

export default function HomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { items, addItem, removeItem, updateItem } = useShoppingList();
  const keyboardOffset = useSharedValue(0);
  // Measured from the real bar via onLayout below — the list's reserved
  // space needs to match the bar's actual rendered height, not a guess.
  const barHeight = useSharedValue(INITIAL_BAR_HEIGHT_ESTIMATE);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      keyboardOffset.value = withTiming(e.endCoordinates.height, { duration: e.duration || 250 });
    });
    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      keyboardOffset.value = withTiming(0, { duration: e.duration || 250 });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  // Shrinks the list's own viewport by keyboard height + bar height, so its
  // bottom edge always sits just above the bar's top edge — whether the bar
  // is resting at the screen bottom or lifted above the keyboard.
  const listAnimatedStyle = useAnimatedStyle(() => ({
    marginBottom: keyboardOffset.value + barHeight.value,
  }));

  // The bar only needs to clear the keyboard itself; its own height is
  // already accounted for in the list's margin above.
  const barAnimatedStyle = useAnimatedStyle(() => ({
    bottom: keyboardOffset.value,
  }));

  const handleBarLayout = (e: LayoutChangeEvent) => {
    barHeight.value = e.nativeEvent.layout.height;
  };

  const handleAdd = (name: string) => {
    addItem(name);
  };

  // Fires after the list actually re-measures its content (e.g. once the new
  // row has been laid out), unlike scrollToEnd() called right after addItem,
  // which can run before the new item's height is included and land on n-1.
  const handleContentSizeChange = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: 'Shopping List',
          headerRight: () => (
            <Pressable
              accessibilityLabel="Settings"
              hitSlop={12}
              onPress={() => router.push('/settings')}
            >
              <Icon as={Settings} size={22} className="text-muted-foreground" />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 pt-3">
        <View className="flex-1">
          <Animated.View style={[{ flex: 1 }, listAnimatedStyle]}>
            <FlatList
              ref={flatListRef}
              className="flex-1 mx-4"
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ItemRow item={item} onRemove={removeItem} onEdit={updateItem} />
              )}
              contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
              onContentSizeChange={handleContentSizeChange}
              ListEmptyComponent={
                <Text className="text-center text-muted-foreground text-base leading-6">
                  Your list is empty.
                </Text>
              }
              keyboardShouldPersistTaps="handled"
            />
          </Animated.View>
          <Animated.View
            onLayout={handleBarLayout}
            style={[{ position: 'absolute', left: 0, right: 0 }, barAnimatedStyle]}
          >
            <AddItemBar onAdd={handleAdd} />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
