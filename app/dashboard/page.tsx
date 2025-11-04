import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

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
          <h2 className="text-xl font-semibold mb-4">License Status</h2>
          {license ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold capitalize">{license.type.toLowerCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
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
              {license.currentPeriodEnd && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Renews</span>
                  <span className="font-semibold">
                    {new Date(license.currentPeriodEnd).toLocaleDateString()}
                  </span>
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
            <p className="text-gray-600 text-center py-8">
              No metrics yet. Start monitoring to see data here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

