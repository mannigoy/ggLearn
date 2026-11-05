/** Simple flat icons, drawn on a 24px grid with round strokes. Decorative unless given a `label`. */
const PATHS = {
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20M8.5 7.5h7',
  flask: 'M9 3h6M10 3v6.2l-5.3 8.9A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.7-2.9L14 9.2V3M7.4 15h9.2',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  leaf: 'M5 19C5 10 10.5 4.5 20 4.5c0 9.5-5.5 15-14 15zM5 19l7.5-7.5',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3.2 3.2 3.2 14.8 0 18M12 3c-3.2 3.2-3.2 14.8 0 18',
  bolt: 'M13 2.5L5 13.5h6l-1 8 8-11h-6z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9.2C7.5 20 4 17 4 12V6zM8.5 12l2.5 2.5 4.5-5',
  home: 'M3 11l9-7.5 9 7.5M5.5 9.5V20h13V9.5M10 20v-5.5h4V20',
  users: 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16.5 11a3 3 0 1 0 0-6M17.5 14.5c2.4.4 4 2.6 4 5.5',
  mail: 'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3.5 7.5l8.5 6 8.5-6',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1A3.5 3.5 0 0 0 8 10.5M16 6h3.5v1a3.5 3.5 0 0 1-3.5 3.5M12 13v4M8 21h8M10 17h4v4',
  chart: 'M4 4v16h16M8.5 16v-4.5M12.5 16V8M16.5 16v-6.5',
  pencil: 'M4 20l4.2-1L19.5 7.7a2 2 0 0 0 0-2.8l-.4-.4a2 2 0 0 0-2.8 0L5 15.8zM14.5 6.5l3 3',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13A1.5 1.5 0 0 1 20 12.5v7a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5v-7A1.5 1.5 0 0 1 5.5 11z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  kitchen: 'M6 3v7a3 3 0 0 0 6 0V3M9 3v18M17 3c-2 2-2.5 5-2.5 8h3.5v10',
  drop: 'M12 3c4 5 6.5 8.2 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 11.2 8 8 12 3z',
  sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z'
};

export const STAR = 'M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z';

export default function Icon({ name, size = 24, label, filled = false, className = '', strokeWidth = 2.3 }) {
  const d = name === 'star' ? STAR : PATHS[name];
  const fill = name === 'star' || filled ? 'currentColor' : 'none';
  return (
    <svg
      className={`icon ${className}`} viewBox="0 0 24 24" width={size} height={size}
      fill={fill} stroke="currentColor" strokeWidth={name === 'star' ? 1.5 : strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

/** A flat icon sitting in a round colour block. */
export const IconBubble = ({ name, tone = 'sky', size = 28 }) => (
  <span className={`bubble ${tone}`} aria-hidden="true"><Icon name={name} size={size} /></span>
);
