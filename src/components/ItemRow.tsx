import { useEffect, useRef, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { ShoppingItem } from '@/schemas';

type Props = {
  item: ShoppingItem;
  index: number;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
  onEditFocus: (index: number) => void;
  // Set for an item that just handed off from the ghost restore preview —
  // it already animated in there, so its own FadeIn would double up.
  skipEntrance?: boolean;
};

const FADE_DISTANCE = 150;
const REMOVE_THRESHOLD = 90;
const EXIT_DURATION_MS = 150;
const SETTLE_DURATION_MS = 150;

export const ItemRow = ({ item, index, onRemove, onEdit, onEditFocus, skipEntrance }: Props) => {
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

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

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
          </Animated.View>
        </GestureDetector>
      )}
    </Animated.View>
  );
};
