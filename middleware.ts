import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const permissionsPolicy = [
  "accelerometer=()",
  "ambient-light-sensor=()",
  "autoplay=()",
  "camera=()",
  "display-capture=()",
  "document-domain=()",
  "encrypted-media=()",
  "fullscreen=(self)",
  "geolocation=()",
  "gyroscope=()",
  "hid=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "picture-in-picture=(self)",
  "publickey-credentials-get=()",
  "screen-wake-lock=()",
  "usb=()",
  "xr-spatial-tracking=()",
].join(", ");

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isDev = process.env.NODE_ENV === "development";

  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  response.headers.set("Permissions-Policy", permissionsPolicy);

  const cspDirectives = [
    "default-src 'self'",
    [
      "script-src",
      "'self'",
      "'unsafe-inline'", // Required for Intercom bootstrap snippet
      isDev ? "'unsafe-eval'" : "",
      "https://js.stripe.com",
      "https://vercel.live",
      "https://widget.intercom.io",
      "https://js.intercomcdn.com",
    ]
      .filter(Boolean)
      .join(" "),
    [
      "style-src",
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ].join(" "),
    [
      "img-src",
      "'self'",
      "data:",
      "https:",
      "https://static.intercomassets.com",
      "https://static.intercomcdn.com",
    ].join(" "),
    [
      "font-src",
      "'self'",
      "data:",
      "https://fonts.gstatic.com",
      "https://static.intercomassets.com",
      "https://static.intercomcdn.com",
      "https://js.intercomcdn.com",
    ].join(" "),
    [
      "connect-src",
      "'self'",
      "https://api.stripe.com",
      "https://vercel.live",
      "https://api-iam.intercom.io",
      "https://api.intercom.io",
      "https://widget.intercom.io",
      "https://nexus-websocket-a.intercom.io",
      "wss://nexus-websocket-a.intercom.io",
      "https://nexus-websocket-b.intercom.io",
      "wss://nexus-websocket-b.intercom.io",
      "https://uploads.intercomcdn.com",
    ].join(" "),
    "frame-src https://js.stripe.com https://hooks.stripe.com https://vercel.live https://widget.intercom.io",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "manifest-src 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspDirectives);

  return response;
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

