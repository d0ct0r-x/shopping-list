import { useEffect, useRef, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { GripVertical } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Icon } from '@/components/ui/icon';
import { ROW_TOTAL_HEIGHT } from '@/constants';
import type { ShoppingItem } from '@/schemas';

type Props = {
  item: ShoppingItem;
  index: number;
  itemCount: number;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
  onEditFocus: (index: number) => void;
  // Shared across every row so each one can tell, purely on the UI thread,
  // whether it's the one being dragged. Identified by id (stable across a
  // reorder) rather than index — the real item order changes at drop, so
  // a row's own index prop can point at a different item afterwards, and
  // comparing by index would briefly misattribute the dragged/neighbour
  // styling to whichever row now happens to sit at that old index.
  dragActiveId: SharedValue<string | null>;
  // Only meaningful while isDragLive is true (the array hasn't actually
  // reordered yet, so every row's index prop is still the one the drag
  // started under).
  dragStartIndex: SharedValue<number>;
  dragTargetIndex: SharedValue<number>;
  dragTranslationY: SharedValue<number>;
  // True from the moment a drag starts until it ends — neighbour-shift
  // math only runs while this is true, so it never runs against a stale
  // start/target after the real reorder has changed what each index means.
  isDragLive: SharedValue<boolean>;
  onDragEnd: (id: string, toIndex: number) => void;
  // Set for an item that just handed off from the ghost restore preview —
  // it already animated in there, so its own FadeIn would double up.
  skipEntrance?: boolean;
};

const FADE_DISTANCE = 150;
const REMOVE_THRESHOLD = 90;
const EXIT_DURATION_MS = 150;
const SETTLE_DURATION_MS = 150;

export const ItemRow = ({
  item,
  index,
  itemCount,
  onRemove,
  onEdit,
  onEditFocus,
  dragActiveId,
  dragStartIndex,
  dragTargetIndex,
  dragTranslationY,
  isDragLive,
  onDragEnd,
  skipEntrance,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const remove = () => onRemove(item.id);

  const startEditing = () => {
    setDraft(item.name);
    setEditing(true);
  };

  const commitEdit = () => {
    onEdit(item.id, draft);
    setEditing(false);
  };

  // Ref so the keyboard-hide listener below always calls the latest
  // commitEdit (which closes over the latest draft) without needing to
  // resubscribe on every keystroke.
  const commitEditRef = useRef(commitEdit);
  commitEditRef.current = commitEdit;

  useEffect(() => {
    if (!editing) return;
    // The keyboard can close without the TextInput ever blurring — e.g.
    // Android's back button/gesture only hides the IME by default and is
    // consumed before it reaches JS, so onBlur never fires and edit mode
    // gets stuck open. React to the keyboard actually hiding instead of
    // trying to catch the specific action that closed it.
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      commitEditRef.current();
    });
    return () => sub.remove();
  }, [editing]);

  // Right-swipe only now: left-swipes fail fast (failOffsetX) and fall
  // through to the list-level restore gesture wrapping the FlatList.
  const panGesture = Gesture.Pan()
    .activeOffsetX(10)
    .failOffsetX(-10)
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      const clamped = Math.max(0, e.translationX);
      translateX.value = clamped;
      opacity.value = 1 - Math.min(clamped / FADE_DISTANCE, 1);
    })
    .onEnd((e) => {
      if (e.translationX > REMOVE_THRESHOLD) {
        translateX.value = withTiming(FADE_DISTANCE * 2, { duration: EXIT_DURATION_MS });
        opacity.value = withTiming(0, { duration: EXIT_DURATION_MS }, (finished) => {
          if (finished) scheduleOnRN(remove);
        });
      } else {
        translateX.value = withTiming(0, { duration: SETTLE_DURATION_MS });
        opacity.value = withTiming(1, { duration: SETTLE_DURATION_MS });
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    scheduleOnRN(startEditing);
  });

  // Race lets a horizontal drag win the pan gesture and cancel the tap,
  // while a stationary touch resolves as a tap — same disambiguation the
  // list's own scroll gesture relies on via failOffsetY above.
  const rowGesture = Gesture.Race(panGesture, tapGesture);

  // Handle-only gesture — spatially separate from the row's own pan/tap
  // above, and a sustained vertical drag fails that row gesture immediately
  // via its failOffsetY, so the two never compete for the same touch.
  const dragGesture = Gesture.Pan()
    .onStart(() => {
      dragActiveId.value = item.id;
      dragStartIndex.value = index;
      dragTargetIndex.value = index;
      dragTranslationY.value = 0;
      isDragLive.value = true;
    })
    .onUpdate((e) => {
      // Clamp to the list's actual bounds — without this, the row (and the
      // finger tracking it) can drift above the first item or below the
      // last one even though the computed target index below is already
      // clamped, making the dragged row visually float off the list.
      const maxUp = -dragStartIndex.value * ROW_TOTAL_HEIGHT;
      const maxDown = (itemCount - 1 - dragStartIndex.value) * ROW_TOTAL_HEIGHT;
      const clamped = Math.min(Math.max(e.translationY, maxUp), maxDown);
      dragTranslationY.value = clamped;
      dragTargetIndex.value = Math.max(
        0,
        Math.min(itemCount - 1, Math.round(dragStartIndex.value + clamped / ROW_TOTAL_HEIGHT)),
      );
    })
    .onEnd(() => {
      // Reset immediately — this row's own flex position never actually
      // moved during the drag (the real reorder only happens now, via
      // onDragEnd), so handing off here means LinearTransition animates it
      // cleanly from its real original slot to its real new one, rather
      // than us trying to fake an instant, invisible handoff that fights
      // LinearTransition's own layout diffing.
      isDragLive.value = false;
      dragActiveId.value = null;
      dragTranslationY.value = 0;
      scheduleOnRN(onDragEnd, item.id, dragTargetIndex.value);
    });

  const rowAnimatedStyle = useAnimatedStyle(() => {
    if (dragActiveId.value === item.id) {
      // This row is the one being dragged — glued directly to the finger,
      // lifted above its neighbours. No shadow: it renders flush with the
      // FlatList's own clipping bounds, so a real shadow gets cut off on
      // the sides — zIndex alone is enough to show it stacked above
      // whatever it's currently passing over.
      return {
        transform: [{ translateX: translateX.value }, { translateY: dragTranslationY.value }],
        opacity: opacity.value,
        zIndex: 10,
      };
    }

    if (!isDragLive.value) {
      // No live drag in progress. Snap instantly to zero rather than
      // animating — any real position change (e.g. a reorder that just
      // committed) is handled entirely by LinearTransition on the outer
      // wrapper, and animating this offset back to zero at the same time
      // would double up with that as a visible bounce.
      return {
        transform: [{ translateX: translateX.value }, { translateY: 0 }],
        opacity: opacity.value,
      };
    }

    // A neighbour, live: shift smoothly out of the way if this row's
    // original position falls between where the dragged row started and
    // where it currently sits — purely a visual cue, since the real item
    // order isn't touched until the drag ends.
    let shiftY = 0;
    const start = dragStartIndex.value;
    const target = dragTargetIndex.value;
    if (start < target && index > start && index <= target) {
      shiftY = -ROW_TOTAL_HEIGHT;
    } else if (start > target && index >= target && index < start) {
      shiftY = ROW_TOTAL_HEIGHT;
    }

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: withTiming(shiftY, { duration: 150 }) },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      entering={skipEntrance ? undefined : FadeIn}
      exiting={FadeOut}
      layout={LinearTransition}
      style={{ marginBottom: 8 }}
    >
      {editing ? (
        <View className="flex-row items-center bg-surface rounded-xl min-h-14 pl-3 pr-3">
          <TextInput
            autoFocus
            className="flex-1 p-0 text-base text-foreground"
            style={{ textAlignVertical: 'center' }}
            value={draft}
            onChangeText={setDraft}
            onFocus={() => onEditFocus(index)}
            onBlur={commitEdit}
            returnKeyType="done"
          />
        </View>
      ) : (
        <GestureDetector gesture={rowGesture}>
          <Animated.View
            style={rowAnimatedStyle}
            className="flex-row items-center bg-surface rounded-xl min-h-14 pl-3 pr-3"
          >
            <Text className="text-base text-foreground flex-1">{item.name}</Text>
            {itemCount > 1 && (
              <GestureDetector gesture={dragGesture}>
                <Animated.View hitSlop={12} className="py-2 pl-2">
                  <Icon as={GripVertical} size={18} className="text-muted-foreground" />
                </Animated.View>
              </GestureDetector>
            )}
          </Animated.View>
        </GestureDetector>
      )}
    </Animated.View>
  );
};
