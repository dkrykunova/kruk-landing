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
  sheetRow?: number; // номер рядка в Google Sheets
  brevoSyncedAt?: string;
  welcomeSentAt?: string;
  promoSentAt?: string;
};

export type StartContext = {
  utm: Utm;
  referrer: string;
  location: "hero" | "footer";
  gaClientId?: string;
};

// ── Мінімальний інтерфейс, який реалізують і Redis, і пам'ять ──────────────
interface Kv {
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  sadd(key: string, members: string[]): Promise<void>;
  smismember(key: string, members: string[]): Promise<boolean[]>;
  del(key: string): Promise<void>;
  zrangeAll(key: string): Promise<string[]>;
  zrem(key: string, member: string): Promise<void>;
  zrange(key: string, count: number): Promise<string[]>;
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
    async zrem(k, member) {
      await r.zrem(k, member);
    },
    zrange: (k, count) => r.zrange<string[]>(k, 0, count - 1),
    zrangeAll: (k) => r.zrange<string[]>(k, 0, -1),
    mget: async <T,>(keys: string[]) => (keys.length ? r.mget<(T | null)[]>(...keys) : []),
    async sadd(k, members) {
      if (members.length) await r.sadd(k, members[0], ...members.slice(1));
    },
    smismember: async (k, members) =>
      members.length ? (await r.smismember(k, members)).map((v) => v === 1) : [],
    async del(k) {
      await r.del(k);
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
    async zrem() {},
    zrange: async () => [],
    zrangeAll: async () => [],
    mget: async <T,>(keys: string[]) => keys.map((k) => (alive(k)?.v as T) ?? null),
    async sadd(k, members) {
      const set = new Set((alive(k)?.v as string[]) ?? []);
      members.forEach((m) => set.add(m));
      m.set(k, { v: [...set] });
    },
    smismember: async (k, members) => {
      const set = new Set((alive(k)?.v as string[]) ?? []);
      return members.map((x) => set.has(x));
    },
    async del(k) {
      m.delete(k);
    },
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

// ── Синхронізація з Google Sheets ──────────────────────────────────────────
const SHEETS_PENDING = "waitlist:sheets-pending";
const BREVO_PENDING = "waitlist:brevo-pending";

export const contactKey = (c: Pick<Contact, "channel" | "email" | "tgId">) =>
  c.channel === "telegram" ? tgKey(c.tgId!) : emailKey(c.email);

export async function getContact(key: string): Promise<Contact | null> {
  return kv.get<Contact>(key);
}

export async function patchContact(key: string, patch: Partial<Contact>): Promise<void> {
  const c = await kv.get<Contact>(key);
  if (c) await kv.set(key, { ...c, ...patch });
}

export async function queueSheetSync(key: string): Promise<void> {
  await kv.zadd(SHEETS_PENDING, Date.now(), key);
}

export async function sheetSyncDone(key: string): Promise<void> {
  await kv.zrem(SHEETS_PENDING, key);
}

export async function pendingSheetSync(limit = 50): Promise<string[]> {
  return kv.zrange(SHEETS_PENDING, limit);
}

export const emailContactKey = emailKey;

export async function queueBrevoSync(key: string): Promise<void> {
  await kv.zadd(BREVO_PENDING, Date.now(), key);
}

export async function brevoSyncDone(key: string): Promise<void> {
  await kv.zrem(BREVO_PENDING, key);
}

export async function pendingBrevoSync(limit = 50): Promise<string[]> {
  return kv.zrange(BREVO_PENDING, limit);
}

// ── Розсилки прогріву ──────────────────────────────────────────────────────
// Upstash повертає "1" як число 1 — порівнюємо як рядок.
export const broadcastsEnabled = async () => String(await kv.get("broadcasts:enabled")) === "1";
export const broadcastReady = async (id: string) => String(await kv.get(`broadcast:${id}:ready`)) === "1";

/** Одноразовий замок: true — якщо цей виклик першим «забрав» дію. */
export const claimOnce = (key: string) => kv.set(key, new Date().toISOString(), { nx: true });
export const releaseClaim = (key: string) => kv.del(key);

/** Підписники бота, яким ця розсилка ще не надсилалась (до limit). */
export async function pendingBotRecipients(broadcastId: string, limit: number): Promise<Contact[]> {
  const keys = (await kv.zrangeAll(INDEX)).filter((k) => k.startsWith("waitlist:tg:"));
  const ids = keys.map((k) => k.slice("waitlist:tg:".length));
  const sent = await kv.smismember(`broadcast:${broadcastId}:sent`, ids);
  const todo = keys.filter((_, i) => !sent[i]).slice(0, limit * 2);
  const contacts = await kv.mget<Contact>(todo);
  return contacts.filter((c): c is Contact => !!c && !c.unsubscribedAt).slice(0, limit);
}

export async function markBotSent(broadcastId: string, tgIds: number[]): Promise<void> {
  await kv.sadd(`broadcast:${broadcastId}:sent`, tgIds.map(String));
}
