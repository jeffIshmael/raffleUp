import { NextRequest, NextResponse } from "next/server";
import { checkRaffleEndDate } from "@/lib/cronFunctions";

const CRON_SECRET = process.env.CRON_SECRET_KEY;

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

export async function POST(req: NextRequest) {
  if (!CRON_SECRET) {
    console.error(" Missing CRON_SECRET_KEY in env");
    return unauthorized();
  }

  // ------- AUTHENTICATION LOGIC -------
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-cron-key");

  let isAuthorized = false;

  // Option 1: Bearer Token
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    if (token === CRON_SECRET) isAuthorized = true;
  }

  // Option 2: X-CRON-KEY header
  if (cronHeader && cronHeader === CRON_SECRET) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    console.error(" Unauthorized cron access");
    return unauthorized();
  }

  // ------- METHOD CHECK -------
  if (req.method !== "GET" && req.method !== "POST") {
    return NextResponse.json(
      {
        success: false,
        error: "Method Not Allowed",
      },
      { status: 405 }
    );
  }

  // ------- EXECUTION -------
  try {
    console.log(" Cron executing:", new Date().toISOString());
    await checkRaffleEndDate();

    return NextResponse.json({
      success: true,
      message: "Cron executed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(" Cron execution error:", error);
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
