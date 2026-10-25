// ------------------------------------------------------------------
// Inline SVG icon set — no external image assets.
// Icons are decorative by default (aria-hidden). Pass `label` to expose
// an icon to assistive tech as an image with an accessible name.
// ------------------------------------------------------------------

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  focusable: "false",
};

function Icon({ label, size = 24, className = "icon", children, ...rest }) {
  return (
    <svg
      {...strokeProps}
      {...rest}
      width={size}
      height={size}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    >
      {label ? <title>{label}</title> : null}
      {children}
    </svg>
  );
}

export const FlaskIcon = (p) => (
  <Icon {...p}>
    <path d="M10 3.5h4" />
    <path d="M10 3.5v5.1L4.9 17.2a2.4 2.4 0 0 0 2 3.8h10.2a2.4 2.4 0 0 0 2-3.8L14 8.6V3.5" />
    <path d="M7.3 14.6h9.4" />
    <path d="M10.6 17.6h.01M13.4 18.4h.01" />
  </Icon>
);

export const ShieldCheckIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3 5 5.8v5.4c0 4.2 2.9 7.6 7 9.3 4.1-1.7 7-5.1 7-9.3V5.8L12 3Z" />
    <path d="m9 12 2.2 2.2L15.2 10" />
  </Icon>
);

export const SparklesIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 13.4 8l4.5 1.4-4.5 1.4L12 15.3l-1.4-4.5L6.1 9.4 10.6 8 12 3.5Z" />
    <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    <path d="M5.5 14.5l.5 1.4 1.5.5-1.5.5-.5 1.4-.5-1.4L3.5 16.4l1.5-.5.5-1.4Z" />
  </Icon>
);

export const LayersIcon = (p) => (
  <Icon {...p}>
    <path d="m12 3.5 8.2 4.2L12 11.9 3.8 7.7 12 3.5Z" />
    <path d="m3.8 12 8.2 4.2 8.2-4.2" />
    <path d="m3.8 16.2 8.2 4.2 8.2-4.2" />
  </Icon>
);

export const TrophyIcon = (p) => (
  <Icon {...p}>
    <path d="M7.5 4.5h9v4.2a4.5 4.5 0 1 1-9 0V4.5Z" />
    <path d="M7.5 6H5.2a2.3 2.3 0 0 0 2.3 4M16.5 6h2.3a2.3 2.3 0 0 1-2.3 4" />
    <path d="M12 13.2v3.3M9 19.5h6M10 16.5h4l.5 3H9.5l.5-3Z" />
  </Icon>
);

export const ChartIcon = (p) => (
  <Icon {...p}>
    <path d="M4 19.5V12M10 19.5V6.5M16 19.5v-5M21 19.5H3" />
    <path d="M4 9.5 10 5l6 5.5 5-3.5" />
  </Icon>
);

export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="m5 12.5 4.2 4.2L19 7" />
  </Icon>
);

export const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </Icon>
);

export const ChevronDownIcon = (p) => (
  <Icon {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Icon>
);

export const MenuIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const ClockIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Icon>
);

export const UsersIcon = (p) => (
  <Icon {...p}>
    <circle cx="9.5" cy="9" r="3.2" />
    <path d="M3.5 19.5a6 6 0 0 1 12 0" />
    <path d="M16.2 6.2a3.2 3.2 0 0 1 0 5.9M17.5 14.4a6 6 0 0 1 3 5.1" />
  </Icon>
);

export const MailIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 7.5 7.5 5.4 7.5-5.4" />
  </Icon>
);

export const StarIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className="icon" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9L12 2.6Z" />
  </svg>
);

export const FireIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className="icon" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M13 2c.4 2.6-.6 4.2-2 5.7C9.3 9.4 7.6 11 7.6 14a4.4 4.4 0 0 0 8.8 0c0-1.3-.3-2.4-.9-3.4 2.4.9 4.1 2.9 4.1 5.4A7.6 7.6 0 0 1 12 23.6 7.6 7.6 0 0 1 4.4 16c0-3.2 1.6-5.3 3.6-7.3C10.2 6.8 11.7 5.1 13 2Z" />
  </svg>
);

export const AtomIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className="icon" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(120 12 12)" />
  </svg>
);

export const BookIcon = (p) => (
  <Icon {...p}>
    <path d="M4.5 5.5a2 2 0 0 1 2-2H19v15H6.5a2 2 0 0 0-2 2v-15Z" />
    <path d="M4.5 18.5a2 2 0 0 1 2-2H19" />
  </Icon>
);
