import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Test endpoint to diagnose registration issues
 */
export async function GET(req: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
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
    diagnostics.checks.databaseError = error.stack;
  }

  try {
    // Check bcrypt
    const bcrypt = require("bcryptjs");
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
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ Missing",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? "✅ Set" : "⚠️ Not set (optional)",
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? "⚠️ Not set (optional)",
  };

  return NextResponse.json(diagnostics, { status: 200 });
}
