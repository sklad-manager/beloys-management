import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'belous_session';
const SESSION_SECRET = 'belous_authenticated';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow access to login API
    if (pathname.startsWith('/api/auth/login')) {
        return NextResponse.next();
    }

    // Check for session cookie
    const session = request.cookies.get(SESSION_COOKIE_NAME);
    const isAuthenticated = session?.value === SESSION_SECRET;

    // Redirect to home if not authenticated and trying to access protected routes
    if (!isAuthenticated && !pathname.startsWith('/_next') && !pathname.startsWith('/icon-') && !pathname.startsWith('/manifest.json') && pathname !== '/favicon.ico') {
        // For API routes, return 401
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // For page routes, allow through (we'll handle auth in the page component)
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
