"use client";

import { useState } from "react";



type ResonanceLicenseType = "starter" | "pro";
type SyncscriptLicenseType = "pro" | "team";

interface ResonanceCheckoutButtonProps {
  licenseType: ResonanceLicenseType;
}

interface SyncscriptCheckoutButtonProps {
  licenseType: SyncscriptLicenseType;
}

export function ResonanceCheckoutButton({ licenseType }: ResonanceCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseType,
          product: "resonance",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message
        const errorMsg = data.message || data.error || "Failed to create checkout session";
        alert(`Error: ${errorMsg}`);
        console.error("Checkout API error:", data);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session: No URL returned");
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

export function SyncscriptCheckoutButton({ licenseType }: SyncscriptCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseType,
          product: "syncscript",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message
        const errorMsg = data.message || data.error || "Failed to create checkout session";
        alert(`Error: ${errorMsg}`);
        console.error("Checkout API error:", data);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session: No URL returned");
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
      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {loading ? "Processing..." : "Subscribe Now"}
    </button>
  );
}

