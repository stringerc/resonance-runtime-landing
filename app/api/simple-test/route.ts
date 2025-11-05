import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Ensure route is treated as dynamic

export async function GET() {
  return NextResponse.json({ 
    message: "Simple test route works!",
    timestamp: new Date().toISOString(),
    route: "/api/simple-test"
  });
}
