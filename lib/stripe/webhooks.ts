import Stripe from "stripe";
import { stripe } from "./config";
import { prisma } from "../db";
import { LicenseStatus, LicenseType, ProductType, ResonanceLicenseType } from "@prisma/client";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const requireStripe = (): Stripe => {
  if (!stripe) {
    throw new Error("Stripe client is not configured. Please set STRIPE_SECRET_KEY.");
  }
  return stripe;
};

const normalizeResonanceLicenseType = (licenseType?: string | null): ResonanceLicenseType | null => {
  if (!licenseType) {
    return null;
  }
  const normalized = licenseType.toLowerCase() as ResonanceLicenseType;
  return normalized === "starter" || normalized === "pro" || normalized === "enterprise" ? normalized : null;
};

const toLegacyLicenseType = (licenseType: ResonanceLicenseType): LicenseType => {
  switch (licenseType) {
    case "starter":
      return LicenseType.BASIC;
    case "pro":
      return LicenseType.PRO;
    case "enterprise":
      return LicenseType.ENTERPRISE;
  }
};

/**
 * Verify and parse Stripe webhook event
 * CRITICAL: Always verify signature to prevent replay attacks
 */
export async function verifyWebhook(
  body: string,
  signature: string | null
): Promise<Stripe.Event> {
  if (!signature) {
    throw new Error("No Stripe signature provided");
  }
  
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  
  try {
    const stripeClient = requireStripe();
    const event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    
    return event;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    throw new Error(`Webhook Error: ${message}`);
  }
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const processed = await prisma.webhookEvent.findUnique({
    where: { eventId },
  });
  
  return processed?.processed || false;
}

/**
 * Mark webhook event as processed
 */
export async function markEventProcessed(
  eventId: string,
  type: string,
  payload?: Stripe.Event
): Promise<void> {
  await prisma.webhookEvent.upsert({
    where: { eventId },
    create: {
      eventId,
      type,
      processed: true,
      processedAt: new Date(),
      payload: payload ? JSON.parse(JSON.stringify(payload)) : null,
    },
    update: {
      processed: true,
      processedAt: new Date(),
    },
  });
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
      
    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
      
    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
      
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
      
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle checkout.session.completed
 * Activate license when payment succeeds
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripeClient = requireStripe();

  // Try to get metadata from session first
  let userId = session.metadata?.userId;
  let licenseType = session.metadata?.licenseType;
  
  // If not in session metadata, try to get from subscription metadata
  if (!userId || !licenseType) {
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
    
    if (subscriptionId) {
      try {
        const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
        userId = subscription.metadata?.userId || userId;
        licenseType = subscription.metadata?.licenseType || licenseType;
      } catch (error) {
        console.error("Error fetching subscription metadata:", error);
      }
    }
  }
  
  const normalizedLicenseType = normalizeResonanceLicenseType(licenseType);

  if (!userId || !normalizedLicenseType) {
    console.error("Missing userId or licenseType in checkout session metadata. Session ID:", session.id);
    console.error("Session metadata:", session.metadata);
    return;
  }
  
  // Get customer ID
  const customerId = typeof session.customer === "string" 
    ? session.customer 
    : session.customer?.id;
  
  if (!customerId) {
    console.error("No customer ID in checkout session");
    return;
  }
  
  // Get subscription ID
  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;
  
  if (!subscriptionId) {
    console.error("No subscription ID in checkout session");
    return;
  }
  
  // Fetch subscription details
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  
  // Check if license exists for this user
  const existingLicense = await prisma.license.findFirst({
    where: { userId },
  });
  
  if (existingLicense) {
    // Update existing license
    await prisma.license.update({
      where: { id: existingLicense.id },
      data: {
        productType: ProductType.RESONANCE,
        resonanceType: normalizedLicenseType,
        syncscriptType: null,
        type: toLegacyLicenseType(normalizedLicenseType),
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeProductId: subscription.items.data[0]?.price.product as string,
        status: LicenseStatus.ACTIVE,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  } else {
    // Create new license
    await prisma.license.create({
      data: {
        userId,
        productType: ProductType.RESONANCE,
        resonanceType: normalizedLicenseType,
        syncscriptType: null,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeProductId: subscription.items.data[0]?.price.product as string,
        type: toLegacyLicenseType(normalizedLicenseType),
        status: LicenseStatus.ACTIVE,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }
  
  console.log(`License activated for user ${userId}`);
}

/**
 * Handle invoice.payment_succeeded
 * Create or renew license subscription
 * This is a fallback if checkout.session.completed didn't create the license
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const stripeClient = requireStripe();
  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;
  
  if (!customerId) {
    console.error("No customer ID in invoice");
    return;
  }
  
  const subscriptionId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription?.id;
  
  if (!subscriptionId) {
    console.error("No subscription ID in invoice");
    return;
  }
  
  // Fetch subscription
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  
  // Extract metadata from invoice line items or subscription metadata
  // Metadata is often in the first line item's metadata
  let userId: string | undefined;
  let licenseType: string | undefined;
  
  // Try subscription metadata first
  if (subscription.metadata?.userId && subscription.metadata?.licenseType) {
    userId = subscription.metadata.userId;
    licenseType = subscription.metadata.licenseType;
  }
  
  // Try invoice line item metadata (this is where it often is)
  if ((!userId || !licenseType) && invoice.lines?.data && invoice.lines.data.length > 0) {
    const firstLineItem = invoice.lines.data[0];
    if (firstLineItem.metadata?.userId && firstLineItem.metadata?.licenseType) {
      userId = firstLineItem.metadata.userId;
      licenseType = firstLineItem.metadata.licenseType;
    }
  }
  
  // Try invoice subscription_details metadata
  if ((!userId || !licenseType) && invoice.subscription_details?.metadata) {
    userId = invoice.subscription_details.metadata.userId;
    licenseType = invoice.subscription_details.metadata.licenseType;
  }
  
  // Check if license exists
  let license = await prisma.license.findFirst({
    where: { stripeCustomerId: customerId },
  });
  
  // If no license exists and we have metadata, create one
  const normalizedLicenseType = normalizeResonanceLicenseType(licenseType);

  if (!license && userId && normalizedLicenseType) {
    console.log(`Creating license from invoice.payment_succeeded for user ${userId}`);
    license = await prisma.license.create({
      data: {
        userId,
        productType: ProductType.RESONANCE,
        resonanceType: normalizedLicenseType,
        syncscriptType: null,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeProductId: subscription.items.data[0]?.price.product as string,
        type: toLegacyLicenseType(normalizedLicenseType),
        status: LicenseStatus.ACTIVE,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
    console.log(`License created for user ${userId} from invoice webhook`);
  } else if (license) {
    // Update existing license
    await prisma.license.update({
      where: { id: license.id },
      data: {
        status: LicenseStatus.ACTIVE,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        ...(normalizedLicenseType
          ? {
              productType: ProductType.RESONANCE,
              resonanceType: normalizedLicenseType,
              syncscriptType: null,
              type: toLegacyLicenseType(normalizedLicenseType),
            }
          : {}),
      },
    });
  } else if (!userId || !normalizedLicenseType) {
    console.error("No license found and missing or invalid metadata in invoice. Cannot create license.");
    console.error("Invoice ID:", invoice.id);
    console.error("Subscription metadata:", subscription.metadata);
    if (invoice.lines?.data?.[0]?.metadata) {
      console.error("Line item metadata:", invoice.lines.data[0].metadata);
    }
    return;
  }
  
  // Record payment
  if (license) {
    await prisma.payment.create({
      data: {
        userId: license.userId,
        licenseId: license.id,
        stripePaymentIntentId: typeof invoice.payment_intent === "string"
          ? invoice.payment_intent
          : invoice.payment_intent?.id || undefined,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: "succeeded",
      },
    });
  }
}

/**
 * Handle invoice.payment_failed
 * Notify user and potentially downgrade license
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;
  
  if (!customerId) return;
  
  const license = await prisma.license.findFirst({
    where: { stripeCustomerId: customerId },
  });
  
  if (license) {
    // Give grace period (e.g., 7 days) before cancellation
    // For now, mark as expired
    await prisma.license.update({
      where: { id: license.id },
      data: {
        status: LicenseStatus.EXPIRED,
      },
    });
    
    // TODO: Send email notification to user
    console.log(`Payment failed for user ${license.userId}`);
  }
}

/**
 * Handle customer.subscription.deleted
 * Cancel license
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const license = await prisma.license.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  
  if (license) {
    await prisma.license.update({
      where: { id: license.id },
      data: {
        status: LicenseStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }
}

/**
 * Handle customer.subscription.updated
 * Update license details when subscription changes
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const license = await prisma.license.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  
  if (license) {
    await prisma.license.update({
      where: { id: license.id },
      data: {
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: subscription.status === "active" ? LicenseStatus.ACTIVE : LicenseStatus.EXPIRED,
      },
    });
  }
}

