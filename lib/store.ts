// Сховище листа очікування.
// Redis (Upstash) — дублі, rate limit, токени, промокоди й копія кожного контакту.
// Без UPSTASH_* у .env.local працює в пам'яті процесу (лише для розробки).
// Далі: Google Sheets як основна таблиця для команди + Brevo.
import "server-only";

import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { generatePromoCode } from "./promo";
import type { Utm } from "./utm";

export type Contact = {
  createdAt: string;
  channel: "email" | "telegram";
  email: string;
  tgId?: number;
  tgUsername?: string;
  tgName?: string;
  consentAt: string;
  consentVersion: string;
  promoCode: string;
  utm: Utm;
  referrer: string;
  formLocation: "hero" | "footer" | "bot";
  unsubscribedAt?: string;
};

export type StartContext = {
  utm: Utm;
  referrer: string;
  location: "hero" | "footer";
  gaClientId?: string;
};

// ── Мінімальний інтерфейс, який реалізують і Redis, і пам'ять ──────────────
interface Kv {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { nx?: boolean; px?: number }): Promise<boolean>;
  incrWindow(key: string, windowMs: number): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<void>;
}

function redisKv(r: Redis): Kv {
  return {
    get: (k) => r.get(k),
    async set(k, v, o = {}) {
      const res = o.nx
        ? await r.set(k, v, o.px ? { nx: true, px: o.px } : { nx: true })
        : await r.set(k, v, o.px ? { px: o.px } : undefined);
      return res === "OK";
    },
    async incrWindow(k, ms) {
      const [n] = await r.pipeline().incr(k).pexpire(k, ms, "NX").exec<[number, number]>();
      return n;
    },
    async zadd(k, score, member) {
      await r.zadd(k, { score, member });
    },
  };
}

function memoryKv(): Kv {
  const g = globalThis as { __krukMem?: Map<string, { v: unknown; exp?: number }> };
  const m = (g.__krukMem ??= new Map());
  const alive = (k: string) => {
    const e = m.get(k);
    if (e?.exp && e.exp < Date.now()) m.delete(k);
    return m.get(k);
  };
  return {
    get: async <T,>(k: string) => (alive(k)?.v as T) ?? null,
    async set(k, v, o = {}) {
      if (o.nx && alive(k)) return false;
      m.set(k, { v, exp: o.px ? Date.now() + o.px : undefined });
      return true;
    },
    async incrWindow(k, ms) {
      const e = alive(k);
      const n = ((e?.v as number) ?? 0) + 1;
      m.set(k, { v: n, exp: e?.exp ?? Date.now() + ms });
      return n;
    },
    async zadd() {},
  };
}

const kv: Kv =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? redisKv(
        new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        }),
      )
    : memoryKv();

// ── Ключі ──────────────────────────────────────────────────────────────────
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const emailKey = (email: string) => `waitlist:email:${sha(email)}`;
const tgKey = (id: number) => `waitlist:tg:${id}`;
const INDEX = "waitlist:all"; // sorted set: ключі всіх контактів за часом запису
const mask = (email: string) => email.replace(/^(.).*@/, "$1***@");

// ── Промокоди ──────────────────────────────────────────────────────────────
/** Генерує промокод і резервує його, щоб гарантувати унікальність. */
export async function reservePromoCode(owner: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generatePromoCode();
    if (await kv.set(`promo:${code}`, owner, { nx: true })) return code;
  }
  throw new Error("Не вдалося згенерувати унікальний промокод");
}

// ── Email ──────────────────────────────────────────────────────────────────
export async function hasEmail(email: string): Promise<boolean> {
  return (await kv.get(emailKey(email))) !== null;
}

/** false — якщо цей email уже записано (зокрема паралельним запитом). */
export async function createEmailContact(c: Contact): Promise<boolean> {
  const key = emailKey(c.email);
  if (!(await kv.set(key, c, { nx: true }))) return false;
  await kv.zadd(INDEX, Date.parse(c.createdAt), key);
  console.log("[waitlist] saved email", mask(c.email), c.promoCode, c.utm);
  return true;
}

// ── Telegram ───────────────────────────────────────────────────────────────
export async function getTgContact(tgId: number): Promise<Contact | null> {
  return kv.get<Contact>(tgKey(tgId));
}

export async function saveTgContact(c: Contact): Promise<void> {
  if (!c.tgId) throw new Error("tgId required");
  const key = tgKey(c.tgId);
  await kv.set(key, c);
  await kv.zadd(INDEX, Date.parse(c.createdAt), key);
  console.log("[waitlist] saved telegram", c.tgId, c.promoCode, c.utm);
}

export async function unsubscribeTg(tgId: number): Promise<void> {
  const c = await getTgContact(tgId);
  if (!c || c.unsubscribedAt) return;
  await kv.set(tgKey(tgId), { ...c, unsubscribedAt: new Date().toISOString() });
  console.log("[waitlist] unsubscribed telegram", tgId);
}

// ── Токени deep link ───────────────────────────────────────────────────────
const TOKEN_TTL = 7 * 24 * 3600_000;

export async function saveStartToken(token: string, ctx: StartContext): Promise<void> {
  await kv.set(`tgstart:${token}`, ctx, { px: TOKEN_TTL });
}

export async function readStartToken(token: string): Promise<StartContext | null> {
  return kv.get<StartContext>(`tgstart:${token}`);
}

// ── Rate limit ─────────────────────────────────────────────────────────────
/** Фіксоване вікно: true, якщо ліміт перевищено. */
export async function rateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  return (await kv.incrWindow(`rl:${key}`, windowMs)) > limit;
}
