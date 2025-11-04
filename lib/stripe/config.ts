import Stripe from "stripe";

// Initialize Stripe only if secret key is available (handles build-time gracefully)
// This allows the build to complete even if Stripe keys aren't set
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16", // Stripe API version
      typescript: true,
    })
  : (null as any); // Type assertion for build-time

// Publishable key (optional for build)
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

/**
 * Product types
 */
export type ProductType = "resonance" | "syncscript";

/**
 * License types for Resonance
 */
export type ResonanceLicenseType = "starter" | "pro" | "enterprise";

/**
 * License types for Syncscript
 */
export type SyncscriptLicenseType = "free" | "pro" | "team" | "enterprise";

/**
 * Get Stripe Price ID for Resonance license type
 */
export function getResonancePriceId(licenseType: ResonanceLicenseType): string {
  const priceIds: Record<string, string> = {
    starter: process.env.STRIPE_RESONANCE_STARTER || "",
    pro: process.env.STRIPE_RESONANCE_PRO || "",
    enterprise: process.env.STRIPE_RESONANCE_ENTERPRISE || "",
  };
  
  const priceId = priceIds[licenseType];
  if (!priceId) {
    throw new Error(`Resonance Price ID not configured for license type: ${licenseType}`);
  }
  
  return priceId;
}

/**
 * Get Stripe Price ID for Syncscript license type
 */
export function getSyncscriptPriceId(licenseType: SyncscriptLicenseType): string {
  // Free tier doesn't need a price ID
  if (licenseType === "free") {
    throw new Error("Free tier does not require a Stripe price ID");
  }
  
  const priceIds: Record<string, string> = {
    pro: process.env.STRIPE_SYNCSCRIPT_PRO || "",
    team: process.env.STRIPE_SYNCSCRIPT_TEAM || "",
    enterprise: process.env.STRIPE_SYNCSCRIPT_ENTERPRISE || "",
  };
  
  const priceId = priceIds[licenseType];
  if (!priceId) {
    throw new Error(`Syncscript Price ID not configured for license type: ${licenseType}`);
  }
  
  return priceId;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getResonancePriceId or getSyncscriptPriceId instead
 */
export function getPriceId(licenseType: "basic" | "pro" | "enterprise"): string {
  // Map legacy types to Resonance types
  const mapping: Record<string, ResonanceLicenseType> = {
    basic: "starter",
    pro: "pro",
    enterprise: "enterprise",
  };
  
  return getResonancePriceId(mapping[licenseType]);
}

