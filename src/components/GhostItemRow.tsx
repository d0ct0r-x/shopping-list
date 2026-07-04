import { Text, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { ShoppingItem } from '@/schemas';

type Props = {
  item: ShoppingItem;
  progress: SharedValue<number>;
  revealDistance: number;
};

export const GhostItemRow = ({ item, progress, revealDistance }: Props) => {
  // Exact mirror of ItemRow's delete transform + opacity: the whole card
  // (background and text) is one rigid object that slides in from the
  // right and fades in together, rather than a static background with
  // only the text animating inside it.
  const rowStyle = useAnimatedStyle(() => {
    const clamped = Math.min(progress.value, revealDistance);
    return {
      transform: [{ translateX: revealDistance - clamped }],
      opacity: clamped / revealDistance,
    };
  });

  return (
    <View className="mb-2">
      <Animated.View
        style={rowStyle}
        className="flex-row items-center bg-surface rounded-xl min-h-14 pl-3 pr-3"
      >
        <Text className="text-base text-foreground flex-1">{item.name}</Text>
      </Animated.View>
    </View>
  );
};
