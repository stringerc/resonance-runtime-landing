import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Skip middleware for API routes entirely - just pass through
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // For all other routes, just pass through without any modifications
  // This is a minimal middleware to avoid any potential errors
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

