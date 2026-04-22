import { Dimensions, PixelRatio } from 'react-native';

// ─── Base Reference ──────────────────────────────────────────────────────────
// The game is played in LANDSCAPE mode.
// In landscape, height is the constraining (smaller) dimension.
// We use the shorter side for scaling to avoid blowing up sizes.
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHORT_SIDE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT); // height in landscape
const LONG_SIDE = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT);  // width in landscape

// Reference: iPhone SE landscape height (~375) as the design base
const BASE_SHORT = 375;
const BASE_LONG = 812;

// ─── Scale Functions ─────────────────────────────────────────────────────────

/** Scale based on the SHORT side of the screen (height in landscape).
 *  Use for: icon sizes, paddings, gaps, component dimensions */
export const scale = (size: number): number =>
  Math.round((SHORT_SIDE / BASE_SHORT) * size);

/** Scale based on the LONG side (width in landscape).
 *  Use for: horizontal widths that should stretch with screen width */
export const horizontalScale = (size: number): number =>
  Math.round((LONG_SIDE / BASE_LONG) * size);

/** Vertical scale — same as scale() in landscape (based on short side) */
export const verticalScale = (size: number): number =>
  Math.round((SHORT_SIDE / BASE_SHORT) * size);

/** Moderate scale — less aggressive, ideal for fonts & icon sizes */
export const moderateScale = (size: number, factor: number = 0.5): number =>
  Math.round(size + (scale(size) - size) * factor);

/** Font scale — ensures readability on all densities */
export const fontScale = (size: number): number => {
  const scaled = moderateScale(size, 0.4);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// ─── Spacing Tokens ──────────────────────────────────────────────────────────
export const spacing = {
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(28),
  xxxl: scale(40),
};

// ─── Typography Tokens ───────────────────────────────────────────────────────
export const fonts = {
  xxs: fontScale(8),
  xs: fontScale(9),
  sm: fontScale(10),
  md: fontScale(11),
  base: fontScale(13),
  lg: fontScale(15),
  xl: fontScale(18),
  xxl: fontScale(22),
  hero: fontScale(28),
  display: fontScale(48),
};

// ─── Border Radius Tokens ────────────────────────────────────────────────────
export const radius = {
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  pill: scale(100),
};

// ─── Icon Size Tokens ────────────────────────────────────────────────────────
export const iconSize = {
  xs: moderateScale(12),
  sm: moderateScale(15),
  md: moderateScale(18),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(52),
};

// ─── Screen Breakpoint Helpers ───────────────────────────────────────────────
export const isSmallScreen = SHORT_SIDE < 360;
export const isMediumScreen = SHORT_SIDE >= 360 && SHORT_SIDE < 414;
export const isLargeScreen = SHORT_SIDE >= 414;
export const isTablet = SHORT_SIDE >= 600;

// ─── Commonly used dimensions ────────────────────────────────────────────────
export const screenWidth = LONG_SIDE;   // always the longer side
export const screenHeight = SHORT_SIDE; // always the shorter side

/** Side panel width for modal screens — responsive with min/max clamp */
export const sidePanel = Math.max(140, Math.min(horizontalScale(200), 280));
