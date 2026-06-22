import { LAYOUT } from '@/constants/ConstantsAndParams';

/**
 * Resolves the antd `Drawer` width for a given desktop target. On mobile
 * the drawer covers the full viewport so forms have maximum usable area;
 * on desktop the provided numeric width is returned untouched.
 */
export function getResponsiveDrawerWidth(
  isMobile: boolean,
  desktopWidth: number,
): number | string {
  return isMobile ? LAYOUT.RESPONSIVE_WIDTHS.MOBILE_FULL : desktopWidth;
}

/**
 * Resolves the antd `Modal` width for a given desktop target. Mirrors the
 * drawer helper: full viewport on mobile, requested width on desktop.
 */
export function getResponsiveModalWidth(
  isMobile: boolean,
  desktopWidth: number,
): number | string {
  return isMobile ? LAYOUT.RESPONSIVE_WIDTHS.MOBILE_FULL : desktopWidth;
}
