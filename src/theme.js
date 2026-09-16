// Every colour here resolves to a CSS custom property defined in index.css, so a
// theme switch is a pure CSS repaint — nothing in JS needs to re-render. The
// previous version hardcoded the dark-mode hex values, which is why light mode
// rendered pale gold text on an off-white background.
const C = {
  gold: "var(--accent)",
  goldDeep: "var(--accent-deep)",
  goldMuted: "var(--accent-muted)",
  onGold: "var(--on-accent)",
  sage: "var(--success)",
  radius: 14,
  copper: "var(--accent)",
  copperDeep: "var(--accent-deep)",
  // Accent used as *text*. A lighter tint in dark mode; a deeper ink in light
  // mode, where the accent that looks right on a button is unreadable as
  // ink. Reach for this whenever the accent is the `color`, not the fill.
  accentText: "var(--accent-text)",
  amber: "var(--accent-muted)",
  // Secondary/teal accent — used sparingly (data viz, secondary states).
  accent2: "var(--accent-2)",
  warning: "var(--warning)",
  error: "var(--error)",
  bg: "var(--bg)",
  surface: "var(--surface)",
  border: "var(--border-c)",
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  muted: "var(--muted)",
  glass: "var(--glass)",
  glassStrong: "var(--glass-strong)",
  glassBorder: "var(--glass-border)",
  glassBorderHover: "var(--glass-border-hover)",
};

/**
 * Apply transparency to a themed colour.
 *
 * Call sites used to write `${C.copper}40` — appending a two-digit alpha to a
 * hex literal. That trick dies the moment the token becomes `var(--accent)`
 * (`var(--accent)40` is invalid CSS and silently drops the declaration), so the
 * same two-digit hex is passed here instead and converted to a percentage.
 *
 *   `${C.copper}40`  ->  `${alpha(C.copper, "40")}`
 */
export function alpha(color, hex) {
  const pct = Math.round((parseInt(hex, 16) / 255) * 100);
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

export default C;
