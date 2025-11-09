"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError("");
  }, [email, password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || "Unable to sign in. Please check your credentials.");
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Sign-in failed:", err);
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 text-neutral-100 flex flex-col lg:flex-row">
      <aside className="hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between bg-surface-900/80 border-r border-surface-800 px-12 py-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-brand-100 text-lg font-semibold hover:text-brand-50 transition">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-neutral-900 font-bold">R</span>
            Resonance Platform
          </Link>
          <div className="mt-16 space-y-6 max-w-xl">
            <h1 className="text-4xl font-bold text-neutral-50 leading-tight">
              Stay in tune with your production systems.
            </h1>
            <p className="text-neutral-300 text-base leading-relaxed">
              Authenticate to unlock Resonance Calculus dashboards, guided onboarding, and live AI insights. Keep the agent streaming for
              steady compliance and actionable guidance.
            </p>
            <div className="rounded-2xl border border-brand-400/20 bg-brand-500/10 px-5 py-4 text-sm text-brand-100">
              <p className="font-semibold">Need access?</p>
              <p className="mt-1 text-brand-50/80">
                Contact your workspace admin or start a free trial from the pricing page. Multi-factor authentication is supported when enabled on your account.
              </p>
            </div>
          </div>
        </div>
        <div className="text-sm text-neutral-500">
          <p>Secure session handling via NextAuth • Encrypted at rest • SOC 2-ready controls</p>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="bg-surface-900/80 border border-surface-800 rounded-2xl shadow-brand-glow p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-50">Sign in</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Welcome back. Enter your credentials to access analytics and automation.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-200">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-surface-700 bg-surface-800/80 px-4 py-3 text-sm text-neutral-50 placeholder-neutral-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-200">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-surface-700 bg-surface-800/80 px-4 py-3 text-sm text-neutral-50 placeholder-neutral-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label htmlFor="remember-me" className="flex items-center gap-2 text-neutral-300">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-surface-600 bg-surface-800 text-brand-400 focus:ring-brand-400"
                  />
                  Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-brand-200 hover:text-brand-100">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-neutral-900 shadow-brand-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-400">
              New to Resonance?{" "}
              <Link href="/auth/signup" className="font-semibold text-brand-200 hover:text-brand-100">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

