import { countClick, rateLimited } from "@/lib/store";

export const dynamic = "force-dynamic";

// Лічильник переходів на партнерів: сторінка надсилає sendBeacon перед переходом за реферальним посиланням.
export async function POST(req: Request) {
  const name = (new URL(req.url).searchParams.get("name") ?? "").replace(/[^a-z0-9:-]/gi, "").slice(0, 80);
  if (!name.startsWith("partner:")) return new Response(null, { status: 400 });
  const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
  try {
    if (!(await rateLimited(`click:${ip}`, 60, 3600_000))) await countClick(name);
  } catch (e) {
    console.error("[click] counter failed", e);
  }
  return new Response(null, { status: 204 });
}
