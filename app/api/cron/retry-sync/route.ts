import { NextResponse } from "next/server";
import { retryPendingSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

// Щогодини: дописати в Google Sheets і Brevo контакти, які не записалися з першої спроби.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}` || !process.env.CRON_SECRET) {
    return new NextResponse(null, { status: 401 });
  }
  return NextResponse.json(await retryPendingSync());
}
