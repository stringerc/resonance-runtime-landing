import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Skip middleware for API routes entirely
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  try {
    const response = NextResponse.next();

    // Only set security headers if we can
    try {
      response.headers.set("X-DNS-Prefetch-Control", "on");
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-XSS-Protection", "1; mode=block");
      response.headers.set(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
      );
      response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
      );
    } catch (headerError) {
      // If setting headers fails, continue without them
      console.error("Error setting security headers:", headerError);
    }

    return response;
  } catch (error) {
    // If middleware fails completely, log and return a basic response
    console.error("Middleware error:", error);
    const response = NextResponse.next();
    return response;
  }
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

