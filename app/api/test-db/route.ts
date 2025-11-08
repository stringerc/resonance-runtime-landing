import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Test database connection endpoint
 * GET /api/test-db
 */
export async function GET() {
  try {
    // Test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: "stringer.c.a@gmail.com" },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      test: result,
      user: user || "User not found",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorCode = typeof error === "object" && error && "code" in error ? (error as { code?: string | number }).code : undefined;
    const details = error instanceof Error ? error.toString() : String(error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
        details,
      },
      { status: 500 }
    );
  }
}

