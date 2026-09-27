import { NextResponse } from "next/server";
import { SHEET_TAB, sheetTitles, sheetsEnabled } from "@/lib/sheets";
import { rateLimited } from "@/lib/store";
import { tg } from "@/lib/telegram";

export const dynamic = "force-dynamic";

type Check = "ok" | "off" | string;

async function check(enabled: boolean, fn: () => Promise<unknown>): Promise<Check> {
  if (!enabled) return "off";
  try {
    await fn();
    return "ok";
  } catch (e) {
    // Лише коротка причина, без секретів і даних.
    return process.env.NODE_ENV === "production" ? "error" : String((e as Error).message).slice(0, 160);
  }
}

export async function GET() {
  const [sheets, redis, telegram] = await Promise.all([
    check(sheetsEnabled(), async () => {
      const titles = await sheetTitles();
      if (!titles.includes(SHEET_TAB)) throw new Error(`немає аркуша "${SHEET_TAB}" (є: ${titles.join(", ")})`);
    }),
    check(!!process.env.UPSTASH_REDIS_REST_URL, () => rateLimited("health", 1e9, 60_000)),
    check(!!process.env.TG_BOT_TOKEN, () => tg("getMe", {})),
  ]);
  const ok = [sheets, redis, telegram].every((c) => c === "ok" || c === "off");
  return NextResponse.json({ sheets, redis, telegram }, { status: ok ? 200 : 503 });
}
