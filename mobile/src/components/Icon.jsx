import Svg, { Circle, Path } from 'react-native-svg';
import { tokens } from '../theme/tokens';

const GLYPHS = {
  book: 'M7 7h4.5a1.5 1.5 0 0 1 1.5 1.5V17a2 2 0 0 0-2-1.5H7zM17 7h-4v9.5a2 2 0 0 1 2-1.5h2z',
  flask: 'M10 6h4v4l3.5 6.5A1.5 1.5 0 0 1 16.2 18H7.8a1.5 1.5 0 0 1-1.3-1.5L10 10z',
  quiz: 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .8-1 1.7M12 16v1.5',
  badge: 'M12 6l1.8 3.7 4.1.6-3 2.9.7 4.1-3.6-1.9-3.6 1.9.7-4.1-3-2.9 4.1-.6z',
  user: 'M12 6.5a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6zM6.8 17.5c.5-2.6 2.6-3.8 5.2-3.8s4.7 1.2 5.2 3.8z',
  plus: 'M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z',
  edit: 'M7 17l.6-3L14.5 7l2.5 2.5L10 16.4zM15.4 6.1l1-1 2.5 2.5-1 1z',
  trash: 'M9 7h6l.5 1H18v1.5H6V8h2.5zM7.5 10.5h9l-.7 7a1 1 0 0 1-1 .9H9.2a1 1 0 0 1-1-.9z',
  up: 'M12 7l5.5 6-1.5 1.4-4-4.4-4 4.4L6.5 13z',
  down: 'M12 17l-5.5-6L8 9.6l4 4.4 4-4.4 1.5 1.4z',
  check: 'M7 12.5l1.5-1.5 2.5 2.5 5-5L17.5 10 11 16.5z',
  back: 'M14 6.5l1.5 1.5-4 4 4 4-1.5 1.5-5.5-5.5z',
  cloud: 'M8.5 17.5a3 3 0 0 1-.4-6 4 4 0 0 1 7.7-.5 3.3 3.3 0 0 1-.3 6.5z',
};

export default function Icon({ name, color = tokens.colors.sky, size = 40 }) {
  const white = tokens.colors.white;
  const line = name === 'quiz';
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Circle cx="12" cy="12" r="12" fill={color} />
      <Path
        d={GLYPHS[name] || GLYPHS.check}
        fill={line ? 'none' : white}
        stroke={white}
        strokeWidth={line ? 1.8 : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
