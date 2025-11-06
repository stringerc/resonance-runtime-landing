import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

/**
 * Get user's license information
 * GET /api/dashboard/license
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
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
  } catch (error: any) {
    console.error("License fetch error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';

