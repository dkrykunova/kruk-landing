import { NextResponse } from "next/server";
import { rateLimited, saveStartToken, type StartContext } from "@/lib/store";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function token(len = 10) {
  const bytes = new Uint32Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

const clip = (v: unknown, n = 200) => (typeof v === "string" ? v.slice(0, n) : undefined);

// Зберігає UTM під коротким токеном для deep link t.me/<bot>?start=<token>.
export async function POST(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (await rateLimited(`tok:${ip}`, 30, 10 * 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  let body: Partial<StartContext> & { utm?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {}
  const u = body.utm ?? {};
  const ctx: StartContext = {
    utm: {
      source: clip(u.source),
      medium: clip(u.medium),
      campaign: clip(u.campaign),
      content: clip(u.content),
      term: clip(u.term),
    },
    referrer: clip(body.referrer, 500) ?? "",
    location: body.location === "footer" ? "footer" : "hero",
    gaClientId: clip(body.gaClientId, 64),
  };
  const t = token();
  await saveStartToken(t, ctx);
  return NextResponse.json({ token: t });
}
