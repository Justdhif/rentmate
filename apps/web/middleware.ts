import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/owner',
  '/tenant',
  '/technician',
  '/admin',
  '/user',
  '/favorites',
  '/properties/create',
  '/dashboard',
  '/rooms',
  '/tenants',
  '/payments',
  '/maintenance',
  '/analytics',
  '/ai-assistant',
  '/settings',
];

const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('rentmate_token')?.value;
  const userCookie = request.cookies.get('rentmate_user')?.value;

  let userRole: string | null = null;
  if (userCookie) {
    try {
      const parsed = JSON.parse(userCookie);
      userRole = parsed?.role || null;
    } catch {
      // ignore JSON parse error
    }
  }

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // 1. If trying to access protected route without a token -> Redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Legacy root redirects for backward compatibility when authenticated
  if (token) {
    const legacyMap: Record<string, string> = {
      '/dashboard':
        userRole === 'OWNER'
          ? '/owner/dashboard'
          : userRole === 'TENANT'
          ? '/tenant/dashboard'
          : userRole === 'TECHNICIAN'
          ? '/technician/dashboard'
          : userRole === 'ADMIN'
          ? '/admin/dashboard'
          : '/user/dashboard',
      '/properties': '/owner/properties',
      '/properties/create': '/owner/properties/create',
      '/rooms': '/owner/rooms',
      '/rooms/create': '/owner/rooms/create',
      '/tenants': '/owner/tenants',
      '/payments':
        userRole === 'TENANT'
          ? '/tenant/payments'
          : '/owner/payments',
      '/maintenance':
        userRole === 'TENANT'
          ? '/tenant/maintenance'
          : userRole === 'TECHNICIAN'
          ? '/technician/maintenance'
          : '/owner/maintenance',
      '/analytics': '/owner/analytics',
      '/ai-assistant': '/owner/ai-assistant',
      '/settings':
        userRole === 'TENANT'
          ? '/tenant/settings'
          : userRole === 'TECHNICIAN'
          ? '/technician/settings'
          : userRole === 'ADMIN'
          ? '/admin/settings'
          : '/owner/settings',
    };

    if (legacyMap[pathname]) {
      return NextResponse.redirect(new URL(legacyMap[pathname], request.url));
    }
  }

  // 3. Strict Role-based Authorization:
  // If user is authenticated and attempts to enter a role route other than their own, redirect to /403
  if (token && userRole) {
    const isOwnerRoute = pathname.startsWith('/owner');
    const isTenantRoute = pathname.startsWith('/tenant');
    const isTechnicianRoute = pathname.startsWith('/technician');
    const isAdminRoute = pathname.startsWith('/admin');

    // Admin can access admin & owner paths if needed, but owner cannot access admin/tenant, etc.
    if (isOwnerRoute && userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
    if (isTenantRoute && userRole !== 'TENANT' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
    if (isTechnicianRoute && userRole !== 'TECHNICIAN' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  // 4. If already logged in and trying to visit login/register -> Redirect to role dashboard,
  // UNLESS it's an invite link with registration parameters (e.g. ?email=... or ?roomId=...)
  if (isAuthRoute && token) {
    const hasInviteParams =
      pathname.startsWith('/register') &&
      (request.nextUrl.searchParams.has('email') ||
        request.nextUrl.searchParams.has('roomId'));

    if (!hasInviteParams) {
      const targetPath =
        userRole === 'OWNER'
          ? '/owner/dashboard'
          : userRole === 'TENANT'
          ? '/tenant/dashboard'
          : userRole === 'TECHNICIAN'
          ? '/technician/dashboard'
          : userRole === 'ADMIN'
          ? '/admin/dashboard'
          : '/user/dashboard';

      return NextResponse.redirect(new URL(targetPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files with extensions (e.g. .svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
