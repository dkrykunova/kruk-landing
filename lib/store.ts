// Сховище листа очікування.
// Етап 1: пам'ять процесу (лише для локальної розробки).
// Етап 2: замінити на Redis (дублі, rate limit) + Google Sheets + Brevo.

import type { Utm } from "./utm";

export type Contact = {
  createdAt: string;
  channel: "email" | "telegram";
  email: string;
  consentAt: string;
  consentVersion: string;
  promoCode: string;
  utm: Utm;
  referrer: string;
  formLocation: "hero" | "footer" | "bot";
};

const contacts = new Map<string, Contact>();
const hits = new Map<string, number[]>();

export async function hasEmail(email: string): Promise<boolean> {
  return contacts.has(email);
}

export async function saveContact(c: Contact): Promise<void> {
  contacts.set(c.email, c);
  console.log("[waitlist] saved", c.email.replace(/^(.).*@/, "$1***@"), c.promoCode, c.utm);
}

/** Ковзне вікно: true, якщо ліміт перевищено. */
export async function rateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > limit;
}
