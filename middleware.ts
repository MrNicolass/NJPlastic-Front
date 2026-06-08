import { NextResponse, type NextRequest } from 'next/server';
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  isPublicRoute,
  isRouteAllowedForRole,
} from '@/constants/Routes';
import type { Role } from '@/stores/useSessionStore';
import { decodeJwtPayload, isJwtExpired } from '@/utils/JwtUtils';

const buildLoginRedirect = (request: NextRequest): NextResponse => {
  const url = request.nextUrl.clone();
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = '/login';
  url.search = `?redirect=${encodeURIComponent(target)}`;
  return NextResponse.redirect(url);
};

const buildForbiddenRewrite = (request: NextRequest): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = '/403';
  url.search = '';
  return NextResponse.rewrite(url);
};

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(url);
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return buildLoginRedirect(request);
  }

  const payload = decodeJwtPayload(token);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (isJwtExpired(payload, nowSeconds)) {
    return buildLoginRedirect(request);
  }

  const role = payload?.role as Role | undefined;
  if (!role) {
    return buildLoginRedirect(request);
  }

  if (!isRouteAllowedForRole(role, pathname)) {
    return buildForbiddenRewrite(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
