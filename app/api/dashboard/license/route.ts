import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

/**
 * Get user's license information
 * GET /api/dashboard/license
 */
export async function GET() {
  try {
    // Get session - NextAuth should automatically read cookies
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // Return more detailed error for debugging
      return NextResponse.json(
        { 
          error: "Unauthorized",
          message: "Please sign in to access your license information",
          debug: {
            hasSession: !!session,
            hasUser: !!session?.user,
            hasUserId: !!session?.user?.id,
          }
        },
        { status: 401 }
      );
    }

    // Fetch user's license
    const license = await prisma.license.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Also check if there are any Stripe subscriptions for this user
    // (in case webhook hasn't processed yet)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        licenses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      license: license || null,
      allLicenses: user?.licenses || [],
      userId: session.user.id,
      email: session.user.email,
    });
  } catch (error: unknown) {
    console.error("License fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';

