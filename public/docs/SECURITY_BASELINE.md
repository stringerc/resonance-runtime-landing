# Security Baseline

This site applies the following defensive controls by default:

- **Transport security** – `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` forces HTTPS for two years.
- **Content Security Policy** – default deny with explicit allow-lists for Stripe and Intercom assets, restricted `frame-ancestors`, `form-action`, `base-uri`, and worker sources.
- **Cross-origin isolation** – `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Resource-Policy: same-site` to prevent cross-origin data leaks.
- **Permissions Policy** – high-risk browser APIs (camera, mic, sensors, payment, etc.) are disabled unless explicitly required.
- **Legacy clickjacking & sniffing protection** – `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff`.
- **Referrer minimisation** – `Referrer-Policy: strict-origin-when-cross-origin`.
- **Authentication cookies** – NextAuth session, CSRF, PKCE, state, and nonce cookies are `Secure`, `HttpOnly`, `SameSite=Lax`, and prefixed with `__Secure-` in production.

Revisit this document whenever new third-party integrations or headers are introduced to ensure the baseline remains accurate.

### Trust Center & Audit Exports

The dashboard Trust Center (`/docs/trust`) summarises this baseline alongside signing and auto-update assurances. Operators can export a JSON/CSV snapshot of the active agent (version, uptime, key metrics) directly from the Overview page, providing compliance evidence without referencing internal systems.
