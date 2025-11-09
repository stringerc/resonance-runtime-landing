import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { checkAccountLockout, resetFailedLogins, recordFailedLogin } from "@/lib/auth/rate-limit";

const isProduction = process.env.NODE_ENV === "production";
const secureCookiePrefix = isProduction ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }
        try {
          // Check account lockout
          const lockout = await checkAccountLockout(credentials.email);
          if (lockout.locked) {
            throw new Error(`Account locked. Try again after ${lockout.unlockAt?.toLocaleTimeString()}`);
          }

          // Find user
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash) {
            await recordFailedLogin(credentials.email);
            throw new Error("Invalid email or password");
          }

          // Verify password
          const isValid = await verifyPassword(credentials.password, user.passwordHash);

          if (!isValid) {
            await recordFailedLogin(credentials.email);
            throw new Error("Invalid email or password");
          }

          // Reset failed login attempts on success
          await resetFailedLogins(credentials.email);

          // Check if MFA is required
          if (user.mfaEnabled) {
            // Return user with MFA flag - frontend will handle MFA challenge
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              mfaRequired: true,
            };
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error: unknown) {
          const message =
            error instanceof Error && /connection (?:closed|terminated|error)/i.test(error.message)
              ? "Authentication service is unavailable. Please try again shortly."
              : error instanceof Error
              ? error.message
              : "Unable to sign in. Please try again.";
          console.error("Credentials authorize error:", error);
          throw new Error(message);
        }
      },
    }),
  ],
  useSecureCookies: isProduction,
  cookies: {
    sessionToken: {
      name: `${secureCookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    csrfToken: {
      name: `${secureCookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    callbackUrl: {
      name: `${secureCookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    pkceCodeVerifier: {
      name: `${secureCookiePrefix}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    state: {
      name: `${secureCookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    nonce: {
      name: `${secureCookiePrefix}next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes (access token lifetime)
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.mfaRequired = "mfaRequired" in user ? Boolean(user.mfaRequired) : false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.mfaRequired = token.mfaRequired ?? false;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    throw new Error("NEXTAUTH_SECRET is not set");
  })(),
};

