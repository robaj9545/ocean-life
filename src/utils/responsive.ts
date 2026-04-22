import { Dimensions, PixelRatio } from 'react-native';

// ─── Base Reference ──────────────────────────────────────────────────────────
// iPhone SE width (smallest common mobile) as the design reference
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// ─── Scale Functions ─────────────────────────────────────────────────────────

/** Scale based on screen width. Use for: widths, horizontal padding, gaps */
export const scale = (size: number): number =>
  Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);

/** Scale based on screen height. Use for: heights, vertical padding, top offsets */
export const verticalScale = (size: number): number =>
  Math.round((SCREEN_HEIGHT / BASE_HEIGHT) * size);

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
export const isSmallScreen = SCREEN_WIDTH < 360;
export const isMediumScreen = SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 414;
export const isLargeScreen = SCREEN_WIDTH >= 414;
export const isTablet = SCREEN_WIDTH >= 600;

// ─── Commonly used dimensions ────────────────────────────────────────────────
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

/** Side panel width for modal screens — responsive with min/max clamp */
export const sidePanel = Math.max(140, Math.min(scale(200), 280));
