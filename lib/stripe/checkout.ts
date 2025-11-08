import { stripe, getResonancePriceId, getSyncscriptPriceId, ResonanceLicenseType, SyncscriptLicenseType } from "./config";

/**
 * Create Stripe Checkout Session for Resonance
 * Uses hosted payment page (PCI-DSS SAQ A compliant)
 */
export async function createResonanceCheckoutSession(
  userId: string,
  licenseType: ResonanceLicenseType,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  }
  
  // Enterprise is custom pricing - contact sales
  if (licenseType === "enterprise") {
    throw new Error("Enterprise pricing is custom. Please contact sales.");
  }
  
  const session = await stripe.checkout.sessions.create({
    customer_email: undefined, // Let Stripe collect email
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: getResonancePriceId(licenseType),
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        userId,
        product: "resonance",
        licenseType,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: "required",
    allow_promotion_codes: true,
  });
  
  return session;
}

/**
 * Create Stripe Checkout Session for Syncscript
 */
export async function createSyncscriptCheckoutSession(
  userId: string,
  licenseType: SyncscriptLicenseType,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  }
  
  // Free tier doesn't require checkout
  if (licenseType === "free") {
    throw new Error("Free tier does not require checkout");
  }
  
  // Enterprise is custom pricing
  if (licenseType === "enterprise") {
    throw new Error("Enterprise pricing is custom. Please contact sales.");
  }
  
  const session = await stripe.checkout.sessions.create({
    customer_email: undefined,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: getSyncscriptPriceId(licenseType),
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        userId,
        product: "syncscript",
        licenseType,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: "required",
    allow_promotion_codes: true,
  });
  
  return session;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use createResonanceCheckoutSession or createSyncscriptCheckoutSession
 */
export async function createCheckoutSession(
  userId: string,
  licenseType: "basic" | "pro" | "enterprise",
  successUrl: string,
  cancelUrl: string
) {
  const mapping: Record<string, ResonanceLicenseType> = {
    basic: "starter",
    pro: "pro",
    enterprise: "enterprise",
  };
  
  return createResonanceCheckoutSession(userId, mapping[licenseType], successUrl, cancelUrl);
}

/**
 * Create one-time payment checkout (for enterprise plans)
 */
export async function createOneTimeCheckout(
  userId: string,
  amount: number, // in cents
  description: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  }
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: description,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: "required",
  });
  
  return session;
}

