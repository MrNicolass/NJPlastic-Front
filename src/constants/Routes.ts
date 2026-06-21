import type { Role } from '@/stores/useSessionStore';

export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/esqueci-senha',
  '/redefinir-senha',
  '/401',
  '/403',
] as const;

export const DEFAULT_AUTHENTICATED_ROUTE = '/dashboard';

const OPERATOR_ROUTES = ['/dashboard', '/maquinas', '/conta'] as const;

const LEADER_ROUTES = [
  ...OPERATOR_ROUTES,
  '/turno',
  '/historico',
  '/relatorios',
  '/ordens',
] as const;

const MANAGER_ROUTES = [
  ...LEADER_ROUTES,
  '/admin',
  '/usuarios',
  '/erp',
  '/auditoria',
] as const;

const ALLOWED_PREFIXES_BY_ROLE: Record<Role, readonly string[]> = {
  OPERATOR: OPERATOR_ROUTES,
  LEADER: LEADER_ROUTES,
  MANAGER: MANAGER_ROUTES,
};

/**
 * Returns `true` when `pathname` matches an allowed prefix for `role`.
 * A prefix matches the path itself or any sub-route under it.
 */
export const isRouteAllowedForRole = (role: Role, pathname: string): boolean => {
  const prefixes = ALLOWED_PREFIXES_BY_ROLE[role];
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

/**
 * Returns `true` when the path belongs to the public set (login, password
 * reset, error pages) — the middleware lets these through without a
 * valid JWT.
 */
export const isPublicRoute = (pathname: string): boolean =>
  PUBLIC_ROUTES.some((route) =>
    route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`),
  );
