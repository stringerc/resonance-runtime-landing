import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "./config";
import { prisma } from "../db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    
    return event;
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
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
  payload?: any
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
  const userId = session.metadata?.userId;
  const licenseType = session.metadata?.licenseType as string;
  
  if (!userId || !licenseType) {
    console.error("Missing userId or licenseType in checkout session metadata");
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
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Create or update license
  await prisma.license.upsert({
    where: { userId }, // One license per user
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeProductId: subscription.items.data[0]?.price.product as string,
      type: licenseType.toUpperCase() as any,
      status: "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeProductId: subscription.items.data[0]?.price.product as string,
      type: licenseType.toUpperCase() as any,
      status: "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
  
  console.log(`License activated for user ${userId}`);
}

/**
 * Handle invoice.payment_succeeded
 * Renew license subscription
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
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
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update license
  const license = await prisma.license.findFirst({
    where: { stripeCustomerId: customerId },
  });
  
  if (license) {
    await prisma.license.update({
      where: { id: license.id },
      data: {
        status: "ACTIVE",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }
  
  // Record payment
  await prisma.payment.create({
    data: {
      userId: license?.userId || "",
      licenseId: license?.id,
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
        status: "EXPIRED",
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
        status: "CANCELLED",
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
        status: subscription.status === "active" ? "ACTIVE" : "EXPIRED",
      },
    });
  }
}

