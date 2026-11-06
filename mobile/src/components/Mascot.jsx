import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { tokens } from '../theme/tokens';
import useReduceMotion from './useReduceMotion';

const { colors } = tokens;

function bob(y, to) {
  return Animated.timing(y, { toValue: to, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
}

export default function Mascot({ size = 96, mood = 'happy' }) {
  const reduce = useReduceMotion();
  const [y] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduce) {
      y.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(Animated.sequence([bob(y, -4), bob(y, 0)]));
    loop.start();
    return () => loop.stop();
  }, [reduce, y]);

  const liquid = mood === 'cheer' ? colors.mint : colors.sky;
  const smile = mood === 'think' ? 'M42 62h16' : 'M41 60q9 9 18 0';
  return (
    <Animated.View
      testID="mascot"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Fizz the flask"
      style={{ transform: [{ translateY: y }] }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect x="40" y="8" width="20" height="8" rx="3" fill={colors.text} />
        <Path
          d="M42 16h16v22l22 38a8 8 0 0 1-7 12H27a8 8 0 0 1-7-12l22-38z"
          fill={colors.white}
          stroke={colors.text}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <Path d="M33 48h34l13 28a6 6 0 0 1-5 9H25a6 6 0 0 1-5-9z" fill={liquid} />
        <Circle cx="41" cy="53" r="3.5" fill={colors.text} />
        <Circle cx="59" cy="53" r="3.5" fill={colors.text} />
        <Path d={smile} stroke={colors.text} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}
