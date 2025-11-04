import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { SyncscriptCheckoutButton } from "@/components/CheckoutButton";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "month",
    description: "Perfect for individual developers",
    features: [
      "Up to 3 scripts",
      "Basic sync features",
      "Community support",
      "Public repositories",
      "GitHub integration",
      "Basic automation",
    ],
    licenseType: "free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "month",
    description: "For professional developers",
    features: [
      "Unlimited scripts",
      "Private repositories",
      "Advanced sync features",
      "Email support",
      "GitHub/GitLab integration",
      "Webhook support",
      "Custom integrations",
    ],
    licenseType: "pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "month",
    description: "For development teams",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Team collaboration",
      "Priority support",
      "Advanced permissions",
      "Team analytics",
      "Shared workspaces",
    ],
    licenseType: "team",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Everything in Team",
      "Unlimited team members",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "SSO/SAML",
      "Advanced security",
      "On-premise option",
    ],
    licenseType: "enterprise",
    popular: false,
  },
];

export default async function SyncscriptPricingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Syncscript
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/resonance/pricing" className="text-gray-600 hover:text-gray-900">
                Resonance Pricing
              </Link>
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Syncscript Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Developer workflow automation. Start free, scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-lg shadow-lg border-2 p-6 ${
                plan.popular
                  ? "border-primary-600 scale-105"
                  : plan.name === "Free"
                  ? "border-green-200"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">/{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === "Free" ? (
                <Link
                  href="/auth/signup"
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Get Started Free
                </Link>
              ) : plan.licenseType === "enterprise" ? (
                <Link
                  href="/contact"
                  className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  Contact Sales
                </Link>
              ) : session ? (
                <SyncscriptCheckoutButton licenseType={plan.licenseType as "pro" | "team"} />
              ) : (
                <Link
                  href="/auth/signup"
                  className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  Start Free Trial
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Why Syncscript?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Free to Start</h3>
              <p className="text-gray-600 text-sm">
                No credit card required. Start with our free tier and upgrade when you need more.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Developer First</h3>
              <p className="text-gray-600 text-sm">
                Built by developers, for developers. Integrates seamlessly with your workflow.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Scale as You Grow</h3>
              <p className="text-gray-600 text-sm">
                From solo developer to enterprise team, we've got you covered at every stage.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

