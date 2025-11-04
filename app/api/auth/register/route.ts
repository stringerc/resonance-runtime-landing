import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { registrationRatelimit } from "@/lib/auth/rate-limit";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters"),
  name: z.string().min(1, "Name is required").optional(),
});

/**
 * Diagnostic GET endpoint - helps debug registration issues
 */
export async function GET(req: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    endpoint: "registration",
    checks: {},
  };

  try {
    // Check database connection
    await prisma.$connect();
    diagnostics.checks.database = "✅ Connected";
    
    // Check if we can query
    const userCount = await prisma.user.count();
    diagnostics.checks.databaseQuery = `✅ Working (${userCount} users)`;
  } catch (error: any) {
    diagnostics.checks.database = `❌ Error: ${error.message}`;
    diagnostics.checks.databaseError = error.stack?.split('\n').slice(0, 5).join('\n');
  }

  try {
    // Check bcrypt
    const bcrypt = require("bcryptjs");
    const testHash = await bcrypt.hash("test", 10);
    diagnostics.checks.bcrypt = "✅ Available";
  } catch (error: any) {
    diagnostics.checks.bcrypt = `❌ Error: ${error.message}`;
  }

  try {
    // Check zxcvbn
    const { zxcvbn } = require("@zxcvbn-ts/core");
    diagnostics.checks.zxcvbn = "✅ Available";
  } catch (error: any) {
    diagnostics.checks.zxcvbn = `❌ Error: ${error.message}`;
  }

  // Check environment variables (hide values)
  diagnostics.checks.env = {
    DATABASE_URL: process.env.DATABASE_URL ? `✅ Set (${process.env.DATABASE_URL.substring(0, 30)}...)` : "❌ Missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ Missing",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? "✅ Set" : "⚠️ Not set (optional)",
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? "✅ Set" : "⚠️ Not set (optional)",
  };

  return NextResponse.json(diagnostics, { status: 200 });
}

/**
 * User Registration Endpoint
 * 
 * Security:
 * - Rate limiting (3 registrations per hour per IP)
 * - Password strength validation (zxcvbn score 3+)
 * - Email uniqueness check
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { success } = await registrationRatelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }
    
    // Parse and validate input
    const body = await req.json();
    const validated = registerSchema.parse(body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(validated.password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: "Password is too weak",
          feedback: passwordValidation.feedback,
        },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(validated.password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        name: validated.name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({
      message: "User registered successfully",
      user,
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    // Log detailed error for debugging
    console.error("Registration error:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    });
    
    // Return more helpful error in development, generic in production
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      { 
        error: "Internal server error",
        ...(isDev && {
          details: error?.message,
          hint: "Check Vercel Function Logs for full error details",
        }),
      },
      { status: 500 }
    );
  }
}

