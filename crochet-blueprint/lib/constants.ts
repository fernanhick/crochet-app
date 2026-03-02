// ── App version — bump on each release ────────────────────────────────────
export const APP_VERSION = "1.0.0";

// ── Design tokens — match prototype CSS :root exactly ──────────────────────
export const Colors = {
  // Core palette
  sun: "#FFD93D",
  coral: "#FF6B6B",
  mint: "#6BCB77",
  sky: "#4D96FF",
  lavender: "#C77DFF",
  peach: "#FFB347",
  ink: "#1A1A2E",
  ink2: "#2D2D44",
  white: "#FFFEF9",
  offwhite: "#F7F3FF",
  gray: "#6B6B8A",

  // Tinted backgrounds (named *Bg and *Light — both aliases work)
  coralBg: "#FFE8E8",
  sunBg: "#FFF5CC",
  mintBg: "#E2F7E4",
  skyBg: "#E0EEFF",
  lavenderBg: "#F0E5FF",
  peachBg: "#FFE8D0",
  roseBg: "#FFE0EE",
  tealBg: "#D6F5F2",
  coralLight: "#FFE8E8",
  sunLight: "#FFF5CC",
  mintLight: "#E2F7E4",
  skyLight: "#E0EEFF",
  lavenderLight: "#F0E5FF",
  peachLight: "#FFE8D0",
  roseLight: "#FFE0EE",
  tealLight: "#D6F5F2",
} as const;

// ── Shadow system — hard ink offset (neo-brutalist) ─────────────────────────
// Components access Shadow.default.offsetX / Shadow.default.offsetY
export const Shadow = {
  default: { offsetX: 3, offsetY: 3, color: Colors.ink, elevation: 4 },
  hover: { offsetX: 5, offsetY: 5, color: Colors.ink, elevation: 6 },
  active: { offsetX: 1, offsetY: 1, color: Colors.ink, elevation: 2 },
  large: { offsetX: 4, offsetY: 4, color: Colors.ink, elevation: 5 },
} as const;

// ── Stripe rule colours — in order ─────────────────────────────────────────
export const StripeColors = [
  Colors.coral,
  Colors.sun,
  Colors.mint,
  Colors.sky,
  Colors.lavender,
] as const;

// ── Borders ────────────────────────────────────────────────────────────────
export const Border = {
  width: 2.5,
  widthThin: 1.5,
  widthThick: 3,
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 22,
    xxl: 52,
    pill: 100,
  },
} as const;

// ── Font families ──────────────────────────────────────────────────────────
// headingBold / headingBlack = Fraunces; bodyBold / bodyExtraBold = Nunito
export const Font = {
  // Fraunces (display serif)
  headingBold: "Fraunces_700Bold",
  headingBlack: "Fraunces_900Black",
  display: "Fraunces_700Bold",
  displayBold: "Fraunces_900Black",
  // Nunito (sans-serif UI)
  body: "Nunito_700Bold",
  bodyBold: "Nunito_700Bold",
  bodyExtraBold: "Nunito_800ExtraBold",
  bodyBlack: "Nunito_900Black",
  mono: "Courier New",
} as const;

// ── Font sizes ─────────────────────────────────────────────────────────────
export const FontSize = {
  xxs: 10,
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 15,
  xl: 16,
  "2xl": 17,
  "3xl": 18,
  "4xl": 20,
  "5xl": 22,
  "6xl": 26,
  "7xl": 28,
  hero: 34,
  display: 30,
} as const;

// ── Spacing — numeric index 1–12 (4px base unit) ──────────────────────────
export const Spacing: Record<number, number> = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 48,
  12: 56,
};

// ── Crochet types ──────────────────────────────────────────────────────────
export const CROCHET_TYPES = [
  { id: "amigurumi", label: "Amigurumi", emoji: "🧸", bg: Colors.coralLight },
  { id: "hat", label: "Hat/Beanie", emoji: "🧢", bg: Colors.sunLight },
  { id: "scarf", label: "Scarf", emoji: "🧣", bg: Colors.mintLight },
  { id: "cowl", label: "Cowl/Hood", emoji: "🪬", bg: Colors.skyLight },
  { id: "bag", label: "Bag/Tote", emoji: "👜", bg: Colors.peachLight },
  { id: "blanket", label: "Blanket", emoji: "🛏️", bg: Colors.lavenderLight },
  { id: "dishcloth", label: "Dishcloth", emoji: "🧽", bg: Colors.tealLight },
  { id: "shawl", label: "Shawl", emoji: "🌸", bg: Colors.roseLight },
] as const;

export const DIFFICULTY_LEVELS = [
  { id: "beginner", label: "Beginner", emoji: "🌱" },
  { id: "easy", label: "Easy", emoji: "✅" },
  { id: "intermediate", label: "Intermediate", emoji: "⚡" },
  { id: "advanced", label: "Advanced", emoji: "🔥" },
] as const;

export const COLOR_OPTIONS = [
  { id: "red", hex: "#FF6B6B", label: "Red" },
  { id: "orange", hex: "#FFB347", label: "Orange" },
  { id: "yellow", hex: "#FFD93D", label: "Yellow" },
  { id: "green", hex: "#6BCB77", label: "Green" },
  { id: "teal", hex: "#4ECDC4", label: "Teal" },
  { id: "blue", hex: "#4D96FF", label: "Blue" },
  { id: "purple", hex: "#C77DFF", label: "Purple" },
  { id: "pink", hex: "#FF85A1", label: "Pink" },
  { id: "brown", hex: "#A0522D", label: "Brown" },
  { id: "cream", hex: "#FFFEF9", label: "Cream" },
  { id: "gray", hex: "#9E9E9E", label: "Gray" },
  { id: "black", hex: "#1A1A2E", label: "Black" },
] as const;

export const SIZE_OPTIONS = [
  { id: "small", label: "Small", emoji: "🤏", desc: '< 6"' },
  { id: "medium", label: "Medium", emoji: "✋", desc: '6–12"' },
  { id: "large", label: "Large", emoji: "🙌", desc: '> 12"' },
  { id: "custom", label: "Custom", emoji: "📐", desc: "Enter size" },
] as const;

export const YARN_WEIGHTS = [
  { id: "fingering", label: "Fingering" },
  { id: "dk", label: "DK" },
  { id: "worsted", label: "Worsted" },
] as const;

// Special Features removed in v10 — users can describe features in the free-text brief instead.

// ── Section accent colors (tinted — one per pattern section) ─────────────
export const SECTION_COLORS = [
  Colors.coralBg,
  Colors.skyBg,
  Colors.mintBg,
  Colors.lavenderBg,
  Colors.peachBg,
  Colors.sunBg,
  Colors.tealBg,
  Colors.roseBg,
  Colors.coralBg,
] as const;
