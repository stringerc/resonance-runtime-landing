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
    
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}


