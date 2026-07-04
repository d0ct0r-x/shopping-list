import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { AddItemBar } from '@/components/AddItemBar';
import { GhostItemRow } from '@/components/GhostItemRow';
import { ItemRow } from '@/components/ItemRow';
import { Icon } from '@/components/ui/icon';
import type { ShoppingItem } from '@/schemas';
import { useShoppingList } from '@/useShoppingList';

const INITIAL_BAR_HEIGHT_ESTIMATE = 88;
// Mirrors ItemRow's FADE_DISTANCE/REMOVE_THRESHOLD so restore feels like
// the delete gesture running in reverse.
const RESTORE_REVEAL_DISTANCE = 150;
const RESTORE_THRESHOLD = 90;
const RESTORE_SETTLE_MS = 150;

type ListEntry = { kind: 'item'; item: ShoppingItem } | { kind: 'ghost'; item: ShoppingItem };

export default function HomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { items, addItem, removeItem, updateItem, lastRemoved, restoreLastRemoved } =
    useShoppingList();
  const keyboardOffset = useSharedValue(0);
  const restoreDrag = useSharedValue(0);
  const [isRestoring, setIsRestoring] = useState(false);
  // The item that just handed off from ghost to real ItemRow — skips its
  // own entrance fade since the ghost already animated it into view. Ids
  // are never reused, so this never needs to be cleared back to null.
  const [justRestoredId, setJustRestoredId] = useState<string | null>(null);
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

  const commitRestore = () => {
    if (lastRemoved) setJustRestoredId(lastRemoved.item.id);
    restoreLastRemoved();
    setIsRestoring(false);
  };

  const cancelRestore = () => {
    setIsRestoring(false);
  };

  // Left-swipe anywhere in the list peeks the most recently removed item
  // back into its original spot — the inverse of ItemRow's delete gesture.
  // Only enabled when there's actually something to restore, and it fails
  // fast on rightward drags so each row's own delete swipe still wins there.
  const listRestoreGesture = Gesture.Pan()
    .enabled(!!lastRemoved)
    .activeOffsetX(-10)
    .failOffsetX(10)
    .failOffsetY([-10, 10])
    .onStart(() => {
      scheduleOnRN(setIsRestoring, true);
    })
    .onUpdate((e) => {
      restoreDrag.value = Math.min(Math.max(0, -e.translationX), RESTORE_REVEAL_DISTANCE);
    })
    .onEnd(() => {
      if (restoreDrag.value > RESTORE_THRESHOLD) {
        restoreDrag.value = withTiming(
          RESTORE_REVEAL_DISTANCE,
          { duration: RESTORE_SETTLE_MS },
          (finished) => {
            if (finished) scheduleOnRN(commitRestore);
          },
        );
      } else {
        restoreDrag.value = withTiming(0, { duration: RESTORE_SETTLE_MS }, (finished) => {
          if (finished) scheduleOnRN(cancelRestore);
        });
      }
    });

  const listData = useMemo((): ListEntry[] => {
    const entries: ListEntry[] = items.map((item) => ({ kind: 'item', item }));
    if (isRestoring && lastRemoved) {
      entries.splice(Math.min(lastRemoved.index, entries.length), 0, {
        kind: 'ghost',
        item: lastRemoved.item,
      });
    }
    return entries;
  }, [items, isRestoring, lastRemoved]);

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
          <GestureDetector gesture={listRestoreGesture}>
            <Animated.View style={[{ flex: 1 }, listAnimatedStyle]}>
              <FlatList
                ref={flatListRef}
                className="flex-1 mx-4"
                data={listData}
                keyExtractor={(entry) => entry.item.id}
                renderItem={({ item: entry }) =>
                  entry.kind === 'ghost' ? (
                    <GhostItemRow
                      item={entry.item}
                      progress={restoreDrag}
                      revealDistance={RESTORE_REVEAL_DISTANCE}
                    />
                  ) : (
                    <ItemRow
                      item={entry.item}
                      onRemove={removeItem}
                      onEdit={updateItem}
                      skipEntrance={entry.item.id === justRestoredId}
                    />
                  )
                }
                contentContainerStyle={listData.length === 0 ? styles.emptyContainer : undefined}
                onContentSizeChange={handleContentSizeChange}
                ListEmptyComponent={
                  <Text className="text-center text-muted-foreground text-base leading-6">
                    Your list is empty.
                  </Text>
                }
                keyboardShouldPersistTaps="handled"
              />
            </Animated.View>
          </GestureDetector>
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
