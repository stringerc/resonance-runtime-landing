import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { ResonanceCheckoutButton } from "@/components/CheckoutButton";

const pricingPlans = [
  {
    name: "Basic",
    price: "$29",
    period: "month",
    description: "Perfect for small teams",
    features: [
      "Up to 10 projects",
      "Real-time monitoring",
      "Basic analytics",
      "Email support",
      "7-day data retention",
    ],
    licenseType: "basic",
  },
  {
    name: "Pro",
    price: "$99",
    period: "month",
    description: "For growing businesses",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Custom dashboards",
      "Priority support",
      "90-day data retention",
      "API access",
    ],
    licenseType: "pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Unlimited data retention",
      "SOC 2 compliance",
      "On-premise option",
    ],
    licenseType: "enterprise",
  },
];

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

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

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4">
            <p className="text-sm text-green-800 font-semibold">
              🎉 Launch Special: Early Adopter Pricing - Limited Time Offer
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Choose the plan that's right for you
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Lock in our launch pricing today. Prices will increase to standard rates after the first 100 customers or by March 31, 2025.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-lg shadow-lg border-2 p-8 ${
                plan.popular
                  ? "border-primary-600 scale-105"
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
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">/{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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

              {plan.licenseType === "enterprise" ? (
                <Link
                  href="/contact"
                  className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  Contact Sales
                </Link>
              ) : session ? (
                <ResonanceCheckoutButton licenseType={plan.licenseType === "basic" ? "starter" : "pro"} />
              ) : (
                <Link
                  href="/auth/signup"
                  className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  Get Started
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                will be prorated.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes, all plans include a 14-day free trial. No credit card
                required.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards through Stripe. Enterprise
                customers can also pay via invoice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

