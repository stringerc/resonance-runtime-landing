import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    period: "month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 5 projects",
      "Real-time monitoring",
      "Basic analytics dashboard",
      "Email support",
      "7-day data retention",
      "Network calculus basics",
    ],
    licenseType: "starter",
    popular: false,
  },
  {
    name: "Pro",
    price: "$149",
    period: "month",
    description: "For growing businesses with advanced needs",
    features: [
      "Unlimited projects",
      "Advanced analytics (EVT, network calculus)",
      "Custom dashboards",
      "API access",
      "Priority support",
      "90-day data retention",
      "Max-plus optimization",
      "Tail analysis (GPD)",
    ],
    licenseType: "pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with mission-critical systems",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Unlimited data retention",
      "SOC 2 compliance",
      "On-premise option",
      "Advanced security features",
    ],
    licenseType: "enterprise",
    popular: false,
  },
];

export default async function ResonancePricingPage() {
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
              <Link href="/syncscript/pricing" className="text-gray-600 hover:text-gray-900">
                Syncscript Pricing
              </Link>
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-4 y-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
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
            Resonance Calculus Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enterprise-grade performance analytics powered by advanced network calculus,
            extreme value theory, and max-plus algebra
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
                <CheckoutButton licenseType={plan.licenseType as "starter" | "pro"} />
              ) : (
                <Link
                  href="/auth/signup"
                  className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  Start Free Trial
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Why Resonance Calculus?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Advanced Mathematics</h3>
              <p className="text-gray-600 text-sm">
                Network calculus, EVT, and max-plus algebra provide insights unavailable in standard monitoring tools.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Enterprise Ready</h3>
              <p className="text-gray-600 text-sm">
                SOC 2 compliant, MFA, audit logging, and SLA guarantees for mission-critical systems.
              </p>
            </div>
            <div className="font-semibold mb-2">
              <h3 className="font-semibold mb-2">Proven ROI</h3>
              <p className="text-gray-600 text-sm">
                Customers report 20-30% infrastructure cost reduction and 99.9%  uptime improvement.
              </p>
            </div>
          </div>
        </div>
      </section >
    </div>
  );
}

// Client component for checkout
"use client";

import { useState } from "react";

function CheckoutButton({ licenseType }: { licenseType: "starter" | "pro" }) {
  const [loading, setLoading] = useState(false);
  
  async function handleCheckout() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          licenseType,
          product: "resonance" // Specify this is for Resonance
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Processing..." : "Subscribe Now"}
    </button>
  );
}

