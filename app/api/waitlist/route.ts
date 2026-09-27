import { after, NextResponse } from "next/server";
import { normalizeEmail, validateEmail } from "@/lib/email";
import { createHash } from "node:crypto";
import { createEmailContact, hasEmail, rateLimited, reservePromoCode, type Contact } from "@/lib/store";
import { syncContact } from "@/lib/sync";
import { verifyTurnstile } from "@/lib/turnstile-server";
import type { WaitlistRequest, WaitlistResponse } from "@/lib/waitlist-types";

const CONSENT_VERSION = "2026-10-01";

function reply(body: WaitlistResponse, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

export async function POST(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (await rateLimited(`ip:${ip}`, 5, 10 * 60_000)) {
    return reply({ status: "rate_limited" }, 429, { "Retry-After": "60" });
  }

  let body: WaitlistRequest;
  try {
    body = await req.json();
  } catch {
    return reply({ status: "invalid_email", field: "email" }, 422);
  }

  // Honeypot: боту відповідаємо «успіхом», але нічого не зберігаємо.
  if (body.website) return reply({ status: "ok" });

  if (!(await verifyTurnstile(body.turnstileToken, ip))) return reply({ status: "captcha_failed" }, 400);

  const emailError = validateEmail(body.email ?? "");
  if (emailError === "disposable") return reply({ status: "disposable_email", field: "email" }, 422);
  if (emailError) return reply({ status: "invalid_email", field: "email" }, 422);
  if (body.consent !== true) return reply({ status: "consent_required", field: "consent" }, 422);

  const email = normalizeEmail(body.email);
  const emailHash = createHash("sha256").update(email).digest("hex");
  if (await rateLimited(`email:${emailHash}`, 3, 60 * 60_000)) {
    return reply({ status: "rate_limited" }, 429, { "Retry-After": "60" });
  }
  if (await hasEmail(email)) return reply({ status: "duplicate" });

  const now = new Date().toISOString();
  let contact: Contact;
  try {
    contact = {
      createdAt: now,
      channel: "email",
      email,
      consentAt: now,
      consentVersion: CONSENT_VERSION,
      promoCode: await reservePromoCode(`email:${emailHash}`),
      utm: body.utm ?? {},
      referrer: (body.referrer ?? "").slice(0, 500),
      formLocation: body.location === "footer" ? "footer" : "hero",
    };
    if (!(await createEmailContact(contact))) return reply({ status: "duplicate" });
  } catch (e) {
    console.error("[waitlist] save failed", e);
    return reply({ status: "unavailable" }, 503);
  }

  // Після відповіді: Google Sheets. TODO: Brevo (контакт + атрибути), Meta CAPI (Lead з eventId).
  after(() => syncContact(contact));
  return reply({ status: "ok" });
}
