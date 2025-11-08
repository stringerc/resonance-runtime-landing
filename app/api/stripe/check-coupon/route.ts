import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";

// Explicitly use Node.js runtime (required for Stripe API calls)
export const runtime = 'nodejs';

interface DiagnosticsPayload {
  code: string;
  timestamp: string;
  checks: Record<string, unknown>;
  error?: {
    message: string;
    type?: string;
    code?: string | number;
    stack?: string;
  };
}

/**
 * Diagnostic endpoint to check Stripe coupon status
 * GET /api/stripe/check-coupon?code=TEST100
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code") || "TEST100";

  if (!stripe) {
    return NextResponse.json(
      {
        error: "Stripe not configured",
        message: "STRIPE_SECRET_KEY is not set",
      },
      { status: 500 }
    );
  }

  const diagnostics: DiagnosticsPayload = {
    code,
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    // Check if it's a promotion code
    const promotionCodes = await stripe.promotionCodes.list({
      code: code,
      limit: 10,
    });

    if (promotionCodes.data.length > 0) {
      const promo = promotionCodes.data[0];
      const appliesTo = promo.restrictions?.applies_to;
      const hasProductRestrictions = Array.isArray(appliesTo?.products) && appliesTo.products.length > 0;
      const hasPriceRestrictions = Array.isArray(appliesTo?.prices) && appliesTo.prices.length > 0;
      const promotionRestrictions = {
        products: appliesTo?.products ?? [],
        prices: appliesTo?.prices ?? [],
      };

      diagnostics.checks.promotionCode = {
        found: true,
        id: promo.id,
        active: promo.active,
        code: promo.code,
        coupon: {
          id: promo.coupon.id,
          name: promo.coupon.name,
          valid: promo.coupon.valid,
          percent_off: promo.coupon.percent_off,
          amount_off: promo.coupon.amount_off,
          currency: promo.coupon.currency,
          duration: promo.coupon.duration,
          livemode: promo.coupon.livemode,
          max_redemptions: promo.max_redemptions,
          times_redeemed: promo.times_redeemed,
          expires_at: promo.expires_at,
          created: new Date(promo.created * 1000).toISOString(),
        },
        restrictions: {
          first_time_transaction: promo.restrictions?.first_time_transaction,
          minimum_amount: promo.restrictions?.minimum_amount,
          minimum_amount_currency: promo.restrictions?.minimum_amount_currency,
          // Check if there are product/price restrictions
          has_product_restrictions: hasProductRestrictions,
          has_price_restrictions: hasPriceRestrictions,
          ...promotionRestrictions,
        },
      };

      // Check if it's expired
      if (promo.expires_at && promo.expires_at < Date.now() / 1000) {
        diagnostics.checks.promotionCode.expired = true;
        diagnostics.checks.promotionCode.expiredAt = new Date(
          promo.expires_at * 1000
        ).toISOString();
      }

      // Check if max redemptions reached
      if (
        promo.max_redemptions &&
        promo.times_redeemed >= promo.max_redemptions
      ) {
        diagnostics.checks.promotionCode.maxRedemptionsReached = true;
      }

      // Additional validation checks
      diagnostics.checks.validation = {
        canBeUsed: promo.active && promo.coupon.valid,
        isExpired: promo.expires_at ? promo.expires_at < Date.now() / 1000 : false,
        maxRedemptionsReached: promo.max_redemptions ? promo.times_redeemed >= promo.max_redemptions : false,
        hasFirstTimeRestriction: promo.restrictions?.first_time_transaction === true,
        hasMinimumAmount: !!promo.restrictions?.minimum_amount,
        hasProductRestrictions,
        productRestrictions: promotionRestrictions.products,
        priceRestrictions: promotionRestrictions.prices,
      };
    } else {
      diagnostics.checks.promotionCode = {
        found: false,
        message: "Promotion code not found",
      };

      // Try to find by coupon ID
      try {
        const coupons = await stripe.coupons.list({
          limit: 100,
        });
        const coupon = coupons.data.find((c: Stripe.Coupon) => c.id === code || c.name === code);

        if (coupon) {
          diagnostics.checks.coupon = {
            found: true,
            id: coupon.id,
            name: coupon.name,
            valid: coupon.valid,
            livemode: coupon.livemode,
            percent_off: coupon.percent_off,
            amount_off: coupon.amount_off,
            duration: coupon.duration,
            message: "Coupon found but no promotion code created",
          };
        } else {
          diagnostics.checks.coupon = {
            found: false,
            message: "Coupon not found either",
          };
        }
      } catch (couponError: unknown) {
        diagnostics.checks.coupon = {
          error: couponError instanceof Error ? couponError.message : "Unknown error",
        };
      }
    }

    // Check Stripe mode (from API key or first coupon/promo found)
    diagnostics.checks.stripeMode = {
      livemode: promotionCodes.data.length > 0 
        ? promotionCodes.data[0].livemode 
        : (diagnostics.checks.coupon?.livemode ?? "unknown"),
      apiKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || "not set",
    };
  } catch (error: unknown) {
    const errorDetails: DiagnosticsPayload["error"] = {
      message: "Unknown error",
    };

    if (error instanceof Stripe.errors.StripeError) {
      errorDetails.message = error.message;
      errorDetails.type = error.type;
      errorDetails.code = error.code;
      if (process.env.NODE_ENV === "development" && typeof error.stack === "string") {
        errorDetails.stack = error.stack;
      }
    } else if (error instanceof Error) {
      errorDetails.message = error.message;
      errorDetails.type = error.name;
      if (process.env.NODE_ENV === "development" && typeof error.stack === "string") {
        errorDetails.stack = error.stack;
      }
    }

    diagnostics.error = {
      ...errorDetails,
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}

