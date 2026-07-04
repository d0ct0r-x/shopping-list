import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { ShoppingItem } from '@/schemas';

type Props = {
  item: ShoppingItem;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
};

const FADE_DISTANCE = 150;
const REMOVE_THRESHOLD = 90;
const EXIT_DURATION_MS = 150;
const SETTLE_DURATION_MS = 150;

export const ItemRow = ({ item, onRemove, onEdit }: Props) => {
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

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      opacity.value = 1 - Math.min(Math.abs(e.translationX) / FADE_DISTANCE, 1);
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > REMOVE_THRESHOLD) {
        const direction = e.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * FADE_DISTANCE * 2, {
          duration: EXIT_DURATION_MS,
        });
        opacity.value = withTiming(0, { duration: EXIT_DURATION_MS }, (finished) => {
          if (finished) runOnJS(remove)();
        });
      } else {
        translateX.value = withTiming(0, { duration: SETTLE_DURATION_MS });
        opacity.value = withTiming(1, { duration: SETTLE_DURATION_MS });
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(startEditing)();
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
      entering={FadeIn}
      exiting={FadeOut}
      layout={LinearTransition}
      style={{ marginBottom: 8 }}
    >
      {editing ? (
        <View className="flex-row items-center rounded-xl border border-primary bg-surface min-h-14 pl-3 pr-3">
          <TextInput
            autoFocus
            className="flex-1 py-2 text-base text-foreground"
            value={draft}
            onChangeText={setDraft}
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
