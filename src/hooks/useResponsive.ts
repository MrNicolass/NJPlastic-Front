'use client';

import { Grid } from 'antd';
import type { Breakpoint, UseResponsiveResult } from '@/models/interfaces/hooks/UseResponsive';

const BREAKPOINT_ORDER: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

/**
 * Wrapper around antd `Grid.useBreakpoint()` that exposes coarse-grained
 * device categories instead of forcing every consumer to recompute the
 * same predicates. Mobile means anything under the `md` breakpoint
 * (768px), tablet covers `md`+ up to `lg` (768-991px), desktop covers
 * `lg`+ (>=992px). The `current` field returns the largest matched
 * breakpoint or null while SSR/hydration leaves every flag undefined,
 * which lets consumers fall back to a mobile-first render and avoid the
 * "Sider flashes wide then collapses" hydration glitch.
 */
export function useResponsive(): UseResponsiveResult {
  const screens = Grid.useBreakpoint();

  const mdMatched = screens.md === true;
  const lgMatched = screens.lg === true;
  const anyMatched = BREAKPOINT_ORDER.some((bp) => screens[bp] === true);

  const isMobile = anyMatched ? !mdMatched : true;
  const isTablet = mdMatched && !lgMatched;
  const isDesktop = lgMatched;

  const current = BREAKPOINT_ORDER.find((bp) => screens[bp] === true) ?? null;

  return { isMobile, isTablet, isDesktop, current };
}
