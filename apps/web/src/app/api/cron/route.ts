import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse } from "@/lib/apiAuth";
import { checkRaffleEndDate } from "@/lib/cronFunctions";


async function POST(req: NextRequest) {
     // Validate API key
     if (!validateApiKey(req)) {
        return unauthorizedResponse();
      }
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
