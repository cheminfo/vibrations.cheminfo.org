interface AppLogoProps {
  size?: number;
}

/**
 * The app mark: two atoms on a bond, caught mid-stretch, over the baseline of a
 * spectrum. Drawn from the same primitives the viewer and the chart render with.
 * @param props - Component props.
 * @param props.size - Edge length in pixels.
 * @default size 16
 */
export function AppLogo(props: AppLogoProps) {
  const { size = 16 } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Vibrations logo"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <line x1="11" y1="13" x2="23" y2="13" stroke="#5d6b7a" strokeWidth="3" />
      <circle cx="10" cy="13" r="6" fill="#0072b2" />
      <circle cx="24" cy="13" r="4" fill="#d55e00" />
      <path
        d="M3 28 h5 l2 -7 l2 7 h5 l2 -11 l2 11 h9"
        fill="none"
        stroke="#0072b2"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
