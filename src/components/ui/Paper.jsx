/** Brand pieces: the logo mark, the wordmark, Fizz the mascot, and the decorative shapes. */

export const FlaskMark = ({ size = 36 }) => (
  <svg className="wordmark-mark" viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="16" fill="var(--sun)" />
    <path d="M12.5 7h7v2h-1v5.6l5.6 8.6A2 2 0 0 1 22.4 26H9.6a2 2 0 0 1-1.7-2.8l5.6-8.6V9h-1z" fill="var(--ink)" />
    <circle cx="14" cy="21.5" r="1.6" fill="var(--sun)" />
    <circle cx="18.5" cy="19" r="1.1" fill="var(--sun)" />
  </svg>
);

export const Wordmark = ({ as: Tag = 'span', ...rest }) => (
  <Tag className="wordmark" {...rest}><FlaskMark /><span>GG Learn</span></Tag>
);

/** Fizz: a round-bottom flask with a face. The one illustration a screen may carry. */
export const Mascot = ({ size = 160, className = '' }) => (
  <svg className={`mascot ${className}`} viewBox="0 0 160 184" width={size} height={size * 1.15} aria-hidden="true" focusable="false">
    <defs>
      <clipPath id="fizz-body"><circle cx="80" cy="120" r="52" /></clipPath>
    </defs>
    <g className="mascot-bubbles">
      <circle cx="100" cy="22" r="9" fill="var(--coral)" />
      <circle cx="118" cy="44" r="6" fill="var(--sun)" />
      <circle cx="84" cy="8" r="5" fill="var(--mint)" />
    </g>
    <rect x="62" y="38" width="36" height="40" rx="10" fill="var(--card)" stroke="var(--ink)" strokeWidth="6" />
    <circle cx="80" cy="120" r="52" fill="var(--card)" />
    <g clipPath="url(#fizz-body)">
      <rect x="20" y="114" width="120" height="70" fill="var(--sky)" />
      <circle cx="60" cy="150" r="6" fill="var(--sky-soft)" />
      <circle cx="102" cy="140" r="4" fill="var(--sky-soft)" />
    </g>
    <circle cx="80" cy="120" r="52" fill="none" stroke="var(--ink)" strokeWidth="6" />
    <circle cx="63" cy="104" r="7" fill="var(--ink)" />
    <circle cx="97" cy="104" r="7" fill="var(--ink)" />
    <circle cx="65.5" cy="101.5" r="2.4" fill="var(--card)" />
    <circle cx="99.5" cy="101.5" r="2.4" fill="var(--card)" />
    <circle cx="52" cy="118" r="6" fill="var(--coral)" opacity="0.55" />
    <circle cx="108" cy="118" r="6" fill="var(--coral)" opacity="0.55" />
    <path d="M68 122q12 12 24 0" fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

/** Simple geometric colour blocks for decoration. Pass a set name; each set is a few placed shapes. */
export const Shapes = ({ set = 'a' }) => (
  <div className={`shapes shapes-${set}`} aria-hidden="true">
    <i className="shape circle sky" />
    <i className="shape blob sun" />
    <i className="shape ring coral" />
    <i className="shape dot mint" />
  </div>
);
