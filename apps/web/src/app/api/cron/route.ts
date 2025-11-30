import { NextRequest, NextResponse } from "next/server";
import { checkRaffleEndDate } from "@/lib/cronFunctions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthorized",
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

async function POST(req: NextRequest) {
  // 💥 MUST be inside the handler
  const CRON_SECRET = process.env.CRON_SECRET_KEY;
  if (!CRON_SECRET) {
    console.error("Missing CRON_SECRET_KEY in env");
    return unauthorized();
  }

  // -------- AUTHENTICATION --------
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-cron-key");

  let isAuthorized = false;

  // Option 1: Bearer token
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    if (token === CRON_SECRET) isAuthorized = true;
  }

  // Option 2: custom header
  if (cronHeader === CRON_SECRET) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    console.error("Unauthorized cron access");
    return unauthorized();
  }

  // -------- EXECUTION --------
  try {
    console.log("Cron executing:", new Date().toISOString());
    await checkRaffleEndDate();

    return NextResponse.json({
      success: true,
      message: "Cron executed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Cron execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Cron Error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
