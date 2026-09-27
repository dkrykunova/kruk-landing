import { after, NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/email";
import { emailContactKey, getContact, patchContact } from "@/lib/store";
import { syncToSheet } from "@/lib/sync";

// Brevo → відписка, жорсткий відскок, скарга на спам: позначаємо контакт і таблицю.
// URL: /api/brevo/webhook?secret=<BREVO_WEBHOOK_SECRET>
const STOP_EVENTS = /unsub|hard.?bounce|spam|blocked|invalid/i;

type BrevoEvent = { event?: string; email?: string };

export async function POST(req: Request) {
  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (!secret || new URL(req.url).searchParams.get("secret") !== secret) {
    return new NextResponse(null, { status: 401 });
  }
  let payload: BrevoEvent | BrevoEvent[];
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  for (const ev of Array.isArray(payload) ? payload : [payload]) {
    if (!ev.email || !ev.event || !STOP_EVENTS.test(ev.event)) continue;
    const key = emailContactKey(normalizeEmail(ev.email));
    const c = await getContact(key);
    if (!c || c.unsubscribedAt) continue;
    await patchContact(key, { unsubscribedAt: new Date().toISOString() });
    console.log("[brevo] stop event", ev.event);
    after(() => syncToSheet(key));
  }
  return NextResponse.json({ ok: true });
}
