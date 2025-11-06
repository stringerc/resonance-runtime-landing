import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch user's license
  const license = await prisma.license.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Fetch recent metrics
  const recentMetrics = await prisma.userMetric.findMany({
    where: { userId: session.user.id },
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  // Fetch payments history
  const payments = await prisma.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Resonance Calculus
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{session.user.email}</span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>

        {/* License Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">License Status</h2>
            {license && (
              <Link
                href="/dashboard/canary"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Monitoring →
              </Link>
            )}
          </div>
          {license ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Plan</span>
                  <div className="font-semibold capitalize text-lg mt-1">
                    {license.type?.toLowerCase() === "pro" ? "Pro" : license.type?.toLowerCase() || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        license.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : license.status === "TRIAL"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {license.status}
                    </span>
                  </div>
                </div>
                {license.currentPeriodEnd && (
                  <div>
                    <span className="text-sm text-gray-600">Renews</span>
                    <div className="font-semibold text-lg mt-1">
                      {new Date(license.currentPeriodEnd).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
              {license.status === "ACTIVE" && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Subscription Active</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Access to all Resonance Pro features
                      </p>
                    </div>
                    <Link
                      href="/dashboard/canary"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                    >
                      Open Dashboard
                    </Link>
                  </div>
                </div>
              )}
              {license.status !== "ACTIVE" && (
                <Link
                  href="/pricing"
                  className="block mt-4 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No active license</p>
              <Link
                href="/pricing"
                className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Choose a Plan
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {license && license.status === "ACTIVE" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Resonance Agent</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                <DashboardClient />
              </div>
              <p className="text-xs text-gray-500">Real-time monitoring</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Features</h3>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                Advanced Analytics
              </div>
              <p className="text-xs text-gray-500">EVT, Network Calculus, Max-Plus</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Data Retention</h3>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                90 Days
              </div>
              <p className="text-xs text-gray-500">Historical data access</p>
            </div>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === "succeeded"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payment.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {license && license.status === "ACTIVE" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/canary"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
              >
                <div className="font-semibold text-gray-900 mb-1">View Monitoring</div>
                <div className="text-sm text-gray-600">Real-time Resonance metrics and AI insights</div>
              </Link>
              <Link
                href="/resonance/pricing"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
              >
                <div className="font-semibold text-gray-900 mb-1">Manage Subscription</div>
                <div className="text-sm text-gray-600">Upgrade, downgrade, or cancel your plan</div>
              </Link>
            </div>
          </div>
        )}

        {/* Metrics Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Metrics</h2>
          {recentMetrics.length > 0 ? (
            <div className="space-y-4">
              {recentMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {new Date(metric.timestamp).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {JSON.stringify(metric.data)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No metrics yet. Start monitoring to see data here.
              </p>
              {license && license.status === "ACTIVE" && (
                <Link
                  href="/dashboard/canary"
                  className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                >
                  Go to Monitoring Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

