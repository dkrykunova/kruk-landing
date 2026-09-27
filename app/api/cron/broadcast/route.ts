import { NextResponse } from "next/server";
import { runBroadcasts } from "@/lib/broadcast";

export const dynamic = "force-dynamic";

// Щохвилини з Cloudflare Cron: канал + бот за розкладом content/broadcasts.ts.
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse(null, { status: 401 });
  }
  const url = new URL(req.url);
  const dry = url.searchParams.get("dry") === "1";
  const at = url.searchParams.get("at");
  return NextResponse.json(await runBroadcasts(at && dry ? Date.parse(at) : Date.now(), dry));
}
