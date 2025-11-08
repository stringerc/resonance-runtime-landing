import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { passwordResetRatelimit } from "@/lib/auth/rate-limit";

// Explicitly use Node.js runtime
export const runtime = 'nodejs';

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * Forgot Password Endpoint
 * 
 * Security:
 * - Rate limiting (3 requests per hour per email)
 * - Never reveals if email exists (security best practice)
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and validate input
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Rate limiting
    try {
      const { success } = await passwordResetRatelimit.limit(email);

      if (!success) {
        // Return success message even if rate limited (security best practice)
        return NextResponse.json({
          message: "If an account with that email exists, we've sent password reset instructions.",
        });
      }
    } catch (rateLimitError) {
      // If rate limiting fails, log but continue
      console.warn("Rate limiting error (continuing anyway):", rateLimitError);
    }

    // Check if user exists (but don't reveal if they don't)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success message (security best practice)
    // This prevents email enumeration attacks
    if (user) {
      // TODO: Generate reset token and send email
      // For now, we'll just log it
      console.log(`Password reset requested for: ${email}`);
      
      // In production, you would:
      // 1. Generate a secure reset token
      // 2. Store it in the database with expiration
      // 3. Send email with reset link
      // Example: await sendPasswordResetEmail(user.email, resetToken);
    }

    return NextResponse.json({
      message: "If an account with that email exists, we've sent password reset instructions.",
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Forgot password error:", error);

    // Still return success message on error (security best practice)
    return NextResponse.json({
      message: "If an account with that email exists, we've sent password reset instructions.",
    });
  }
}

