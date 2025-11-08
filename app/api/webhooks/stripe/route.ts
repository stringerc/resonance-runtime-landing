import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyWebhook, isEventProcessed, markEventProcessed, handleStripeEvent } from "@/lib/stripe/webhooks";

/**
 * Stripe Webhook Handler
 * 
 * CRITICAL SECURITY: Always verify webhook signatures
 * This endpoint handles:
 * - checkout.session.completed
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * - customer.subscription.deleted
 * - customer.subscription.updated
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await verifyWebhook(body, signature);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown signature error";
      console.error(`Webhook signature verification failed: ${message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${message}` },
        { status: 400 }
      );
    }
    
    // Check idempotency (prevent duplicate processing)
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`Event ${event.id} already processed`);
      return NextResponse.json({ received: true, duplicate: true });
    }
    
    // Process event
    try {
      await handleStripeEvent(event);
      
      // Mark as processed
      await markEventProcessed(event.id, event.type, event);
      
      return NextResponse.json({ received: true });
    } catch (error: unknown) {
      console.error("Error processing webhook:", error);
      
      // Mark as failed (but don't throw - Stripe will retry)
      await markEventProcessed(event.id, event.type, event);
      
      return NextResponse.json(
        { error: "Error processing webhook" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook (we need raw body for signature verification)
export const runtime = "nodejs";

