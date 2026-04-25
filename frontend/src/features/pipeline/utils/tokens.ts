// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
// RFP Discovery operations console tokens. Kept deliberately restrained for
// dense review workflows: crawl logs, rule decisions, HIL queue, and audit data.
export const T = {
  primary:    "#1D4ED8",
  primaryLt:  "#3B82F6",
  accent:     "#7C3AED",
  teal:       "#0F766E",
  violet:     "#4F46E5",
  blue:       "#2563EB",
  bg:         "#F6F8FB",
  surface:    "#ffffff",
  border:     "#D8DEE8",
  text:       "#172033",
  textMd:     "#4B5565",
  textSm:     "#768196",
  success:    "#15803D",
  warning:    "#B45309",
  danger:     "#B91C1C",
  successBg:  "#EAF7EE",
  warningBg:  "#FFF4DE",
  dangerBg:   "#FDECEC",
  shadow:     "0 1px 2px rgba(15,23,42,.05), 0 8px 20px rgba(15,23,42,.06)",
  shadowMd:   "0 10px 28px rgba(29,78,216,.10)",
} as const;

// Stage colour map
export const STAGE_COLORS: Record<string, string> = {
  discovery: T.primary,
  analysis:  T.violet,
  decision:  T.warning,
  feedback:  T.teal,
};
