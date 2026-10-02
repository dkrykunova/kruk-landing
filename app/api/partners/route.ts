import { after, NextResponse } from "next/server";
import { partnerCategories } from "@/content/uk";
import { sendPartnerConfirmation, brevoEnabled } from "@/lib/brevo";
import { normalizeEmail, validateEmail } from "@/lib/email";
import { appendRow, sheetsEnabled } from "@/lib/sheets";
import { rateLimited, savePartnerApplication, type PartnerApplication } from "@/lib/store";
import { sendMessage } from "@/lib/telegram";
import { verifyTurnstile } from "@/lib/turnstile-server";

const HEADER = ["created_at", "company", "website", "category", "description", "audience", "name", "role", "email", "contact", "consent_at", "utm_source", "utm_campaign", "id"];
const CATEGORIES = new Set([...partnerCategories.map((c) => c.id), "other"]);

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escHtml = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
const label = (id: string) => partnerCategories.find((c) => c.id === id)?.name ?? "Інше";

export async function POST(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (await rateLimited(`partner:${ip}`, 5, 60 * 60_000)) {
    return NextResponse.json({ status: "rate_limited" }, { status: 429 });
  }
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 422 });
  }
  if (b.fax) return NextResponse.json({ status: "ok" }); // пастка для ботів
  if (!(await verifyTurnstile(str(b.turnstileToken, 2048) || undefined, ip))) {
    return NextResponse.json({ status: "captcha_failed" }, { status: 400 });
  }

  const a: PartnerApplication = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    company: str(b.company, 120),
    website: str(b.website, 200),
    category: CATEGORIES.has(str(b.category, 20)) ? str(b.category, 20) : "",
    description: str(b.description, 1000),
    audience: str(b.audience, 300),
    name: str(b.name, 80),
    role: str(b.role, 80),
    email: normalizeEmail(str(b.email, 254)),
    contact: str(b.contact, 80),
    consentAt: new Date().toISOString(),
    utm: typeof b.utm === "object" && b.utm ? (b.utm as PartnerApplication["utm"]) : {},
  };
  const missing = (["company", "category", "description", "name", "email"] as const).filter((k) => !a[k]);
  if (validateEmail(a.email)) missing.push("email");
  if (b.consent !== true) missing.push("consent" as never);
  if (missing.length) return NextResponse.json({ status: "invalid", fields: [...new Set(missing)] }, { status: 422 });

  await savePartnerApplication(a);

  after(async () => {
    const tasks: Promise<unknown>[] = [];
    if (sheetsEnabled()) {
      tasks.push(
        appendRow("partners", HEADER, [
          a.createdAt, a.company, a.website, label(a.category), a.description, a.audience, a.name, a.role, a.email, a.contact,
          a.consentAt, a.utm.source ?? "", a.utm.campaign ?? "", a.id,
        ]),
      );
    }
    const chat = process.env.TEAM_TG_CHAT_ID;
    if (chat) {
      tasks.push(
        sendMessage(
          chat,
          `🤝 <b>Нова заявка партнера</b>\n\n<b>${escHtml(a.company)}</b> — ${escHtml(label(a.category))}\n${escHtml(a.description)}\n\n${escHtml(a.name)}${a.role ? `, ${escHtml(a.role)}` : ""}\n${escHtml(a.email)}${a.contact ? ` · ${escHtml(a.contact)}` : ""}${a.website ? `\n${escHtml(a.website)}` : ""}`,
        ),
      );
    }
    if (brevoEnabled()) tasks.push(sendPartnerConfirmation(a.email, a.company));
    for (const r of await Promise.allSettled(tasks)) {
      if (r.status === "rejected") console.error("[partners] follow-up failed", (r.reason as Error).message);
    }
  });

  return NextResponse.json({ status: "ok" });
}
