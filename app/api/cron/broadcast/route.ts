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
  // at — ISO у UTC (…Z) або мілісекунди; «+03:00» у URL легко псується на пробіл.
  const atRaw = url.searchParams.get("at");
  const at = atRaw ? (/^\d+$/.test(atRaw) ? Number(atRaw) : Date.parse(atRaw.replace(" ", "+"))) : Date.now();
  if (Number.isNaN(at)) return NextResponse.json({ error: "bad at" }, { status: 400 });
  return NextResponse.json(await runBroadcasts(dry ? at : Date.now(), dry));
}
