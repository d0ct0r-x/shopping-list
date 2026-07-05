import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { ROW_TOTAL_HEIGHT } from '@/constants';
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
  // onContentSizeChange fires for any size change (add, delete, restore),
  // but only an add should trigger scrollToEnd — this flags that the next
  // size change is specifically due to one.
  const pendingScrollToEndRef = useRef(false);
  // Tracked so commitRestore can tell whether the restored index is
  // already visible before deciding to scroll to it.
  const scrollOffsetRef = useRef(0);
  const viewportHeightRef = useRef(0);
  // Set when a row starts editing while the keyboard isn't up yet — there's
  // no keyboard-show event to hang the scroll off in that case, so it waits
  // here until the show listener's animation finishes.
  const pendingEditIndexRef = useRef<number | null>(null);
  const { items, addItem, removeItem, updateItem, reorderItem, lastRemoved, restoreLastRemoved } =
    useShoppingList();
  const keyboardOffset = useSharedValue(0);
  const restoreDrag = useSharedValue(0);
  const [isRestoring, setIsRestoring] = useState(false);
  // Drag-reorder state, shared with every row so each one can tell purely
  // on the UI thread whether it's the dragged row or a neighbour that
  // needs to shift out of the way — see ItemRow for the full rationale.
  const dragActiveId = useSharedValue<string | null>(null);
  const dragStartIndex = useSharedValue(-1);
  const dragTargetIndex = useSharedValue(-1);
  const dragTranslationY = useSharedValue(0);
  const isDragLive = useSharedValue(false);
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
      const duration = e.duration || 250;
      keyboardOffset.value = withTiming(e.endCoordinates.height, { duration });
      // The list's viewport only actually shrinks once this animation
      // finishes, so a row that requested an edit-scroll while the
      // keyboard was still closed has to wait until now to be scrolled
      // into its final, correct position.
      if (pendingEditIndexRef.current !== null) {
        const index = pendingEditIndexRef.current;
        pendingEditIndexRef.current = null;
        setTimeout(() => scrollEditingRowIntoView(index), duration);
      }
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
    if (lastRemoved) {
      const restoredIndex = Math.min(lastRemoved.index, items.length);
      setJustRestoredId(lastRemoved.item.id);
      restoreLastRemoved();

      // Only scroll if the restored row actually falls outside the
      // currently visible range — unlike add, which always reveals the
      // new item, restore shouldn't move the list when it's not needed.
      const itemTop = restoredIndex * ROW_TOTAL_HEIGHT;
      const itemBottom = itemTop + ROW_TOTAL_HEIGHT;
      const viewTop = scrollOffsetRef.current;
      const viewBottom = viewTop + viewportHeightRef.current;
      const isVisible = itemBottom > viewTop && itemTop < viewBottom;

      if (!isVisible) {
        flatListRef.current?.scrollToIndex({
          index: restoredIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
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

  const scrollEditingRowIntoView = (index: number) => {
    // Align the row's bottom edge with the bottom of the (already shrunk)
    // list viewport, so it sits just above the bar/keyboard rather than
    // being clipped by them.
    flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 1 });
  };

  const requestEditScroll = (index: number) => {
    if (keyboardOffset.value > 0) {
      // Keyboard's already up — no upcoming show event to hang this off,
      // so scroll immediately.
      scrollEditingRowIntoView(index);
    } else {
      pendingEditIndexRef.current = index;
    }
  };

  const handleDragEnd = (id: string, toIndex: number) => {
    // ItemRow has already reset its own drag state synchronously by the
    // time this runs — this just commits the real order, and
    // LinearTransition (always on) animates every affected row from its
    // real original position to its real new one.
    reorderItem(id, toIndex);
  };

  const handleAdd = (name: string) => {
    pendingScrollToEndRef.current = true;
    addItem(name);
  };

  // Fires after the list actually re-measures its content (e.g. once the new
  // row has been laid out), unlike scrollToEnd() called right after addItem,
  // which can run before the new item's height is included and land on n-1.
  // Also fires for delete/restore, which resize the content too — only act
  // when the resize was actually caused by an add.
  const handleContentSizeChange = () => {
    if (!pendingScrollToEndRef.current) return;
    pendingScrollToEndRef.current = false;
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
  };

  const handleListLayout = (e: LayoutChangeEvent) => {
    viewportHeightRef.current = e.nativeEvent.layout.height;
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
                getItemLayout={(_, index) => ({
                  length: ROW_TOTAL_HEIGHT,
                  offset: ROW_TOTAL_HEIGHT * index,
                  index,
                })}
                renderItem={({ item: entry, index }) =>
                  entry.kind === 'ghost' ? (
                    <GhostItemRow
                      item={entry.item}
                      progress={restoreDrag}
                      revealDistance={RESTORE_REVEAL_DISTANCE}
                    />
                  ) : (
                    <ItemRow
                      item={entry.item}
                      index={index}
                      itemCount={items.length}
                      onRemove={removeItem}
                      onEdit={updateItem}
                      onEditFocus={requestEditScroll}
                      dragActiveId={dragActiveId}
                      dragStartIndex={dragStartIndex}
                      dragTargetIndex={dragTargetIndex}
                      dragTranslationY={dragTranslationY}
                      isDragLive={isDragLive}
                      onDragEnd={handleDragEnd}
                      skipEntrance={entry.item.id === justRestoredId}
                    />
                  )
                }
                contentContainerStyle={listData.length === 0 ? styles.emptyContainer : undefined}
                // Reanimated's layout-shift animation (LinearTransition) moves
                // rows via transform, but removeClippedSubviews clips based on
                // pre-animation layout — on Android this can briefly mis-clip
                // a boundary row (typically the last one) mid-animation.
                removeClippedSubviews={false}
                onContentSizeChange={handleContentSizeChange}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onLayout={handleListLayout}
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
