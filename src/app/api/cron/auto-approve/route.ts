import { NextRequest, NextResponse } from "next/server";
import { autoApproveExpiredSessions } from "@/services/session.service";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await autoApproveExpiredSessions();
    return NextResponse.json({ approved: count });
  } catch (err) {
    console.error("Auto-approve cron failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
