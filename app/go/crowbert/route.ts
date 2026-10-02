import { NextResponse } from "next/server";
import { countClick } from "@/lib/store";

export const dynamic = "force-dynamic";

// Єдина точка переходу на Crowbert: рахує кліки й додає мітки джерела.
// CROWBERT_REF_URL — реферальне посилання від Crowbert (поки немає — головна crowbert.com).
export async function GET(req: Request) {
  const from = (new URL(req.url).searchParams.get("from") ?? "unknown").replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "unknown";
  const target = new URL(process.env.CROWBERT_REF_URL || "https://www.crowbert.com/");
  target.searchParams.set("utm_source", "kruk");
  target.searchParams.set("utm_medium", "referral");
  target.searchParams.set("utm_campaign", "kruk-portal");
  target.searchParams.set("utm_content", from);
  try {
    await countClick(`crowbert:${from}`);
  } catch (e) {
    console.error("[go] counter failed", e);
  }
  return NextResponse.redirect(target.toString(), 302);
}
