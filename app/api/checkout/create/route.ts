import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createResonanceCheckoutSession, createSyncscriptCheckoutSession } from "@/lib/stripe/checkout";
import { z } from "zod";

const checkoutSchema = z.object({
  licenseType: z.string(),
  product: z.enum(["resonance", "syncscript"]).optional(), // Defaults to resonance for backward compatibility
});

/**
 * Create Stripe Checkout Session
 * 
 * Supports both Resonance and Syncscript products
 * Requires authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse input
    const body = await req.json();
    const { licenseType, product = "resonance" } = checkoutSchema.parse(body);
    
    // Build URLs
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = product === "resonance" 
      ? `${baseUrl}/resonance/pricing?canceled=true`
      : `${baseUrl}/syncscript/pricing?canceled=true`;
    
    // Create checkout session based on product
    let checkoutSession;
    if (product === "resonance") {
      checkoutSession = await createResonanceCheckoutSession(
        session.user.id,
        licenseType as any,
        successUrl,
        cancelUrl
      );
    } else {
      checkoutSession = await createSyncscriptCheckoutSession(
        session.user.id,
        licenseType as any,
        successUrl,
        cancelUrl
      );
    }
    
    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

