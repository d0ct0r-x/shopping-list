import { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 16;
const STROKE_WIDTH = 2;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Props = {
  durationMs: number;
  color: string;
  trackColor: string;
};

export const UndoRing = ({ durationMs, color, trackColor }: Props) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: durationMs, easing: Easing.linear });
  }, [durationMs, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: progress.value * CIRCUMFERENCE,
  }));

  return (
    <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={trackColor} strokeWidth={STROKE_WIDTH} fill="none" />
      <AnimatedCircle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={CIRCUMFERENCE}
        strokeLinecap="round"
        fill="none"
        animatedProps={animatedProps}
      />
    </Svg>
  );
};
