// Google Sheets через сервісний акаунт (без важкої бібліотеки googleapis).
// Ключ сервісного акаунта — одним рядком у GOOGLE_SERVICE_ACCOUNT_JSON
// (локально в .env.local, на Cloudflare — секрет воркера).
import "server-only";

import { createSign } from "node:crypto";
import type { Contact } from "./store";

export const SHEET_TAB = "waitlist";

export const COLUMNS = [
  "created_at",
  "channel",
  "email",
  "tg_id",
  "tg_username",
  "tg_name",
  "consent_at",
  "consent_version",
  "promo_code",
  "promo_sent_at",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "referrer",
  "form_location",
  "brevo_synced",
  "unsubscribed_at",
] as const;

const LAST_COL = String.fromCharCode(64 + COLUMNS.length); // S

type ServiceAccount = { client_email: string; private_key: string };

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  return raw ? JSON.parse(raw) : null;
}

export const sheetsEnabled = () => !!process.env.SHEET_ID && !!serviceAccount();

let cached: { token: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const sa = serviceAccount();
  if (!sa) throw new Error("Сервісний акаунт Google не налаштовано");

  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const data = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!data.access_token) throw new Error(`Google OAuth: ${data.error_description ?? res.status}`);
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cached.token;
}

async function api<T>(pathAndQuery: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}${pathAndQuery}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${await accessToken()}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Sheets ${res.status}: ${data?.error?.message ?? "error"}`);
  return data as T;
}

let headerReady = false;

/** Створює рядок заголовків, якщо аркуш порожній. */
export async function ensureHeader(): Promise<void> {
  if (headerReady) return;
  const range = encodeURIComponent(`${SHEET_TAB}!A1:${LAST_COL}1`);
  const got = await api<{ values?: string[][] }>(`/values/${range}`);
  if (!got.values?.[0]?.length) {
    await api(`/values/${range}?valueInputOption=RAW`, {
      method: "PUT",
      body: JSON.stringify({ values: [COLUMNS] }),
    });
  }
  headerReady = true;
}

function toRow(c: Contact): string[] {
  const v: Record<(typeof COLUMNS)[number], string> = {
    created_at: c.createdAt,
    channel: c.channel,
    email: c.email,
    tg_id: c.tgId ? String(c.tgId) : "",
    tg_username: c.tgUsername ?? "",
    tg_name: c.tgName ?? "",
    consent_at: c.consentAt,
    consent_version: c.consentVersion,
    promo_code: c.promoCode,
    promo_sent_at: "",
    utm_source: c.utm.source ?? "",
    utm_medium: c.utm.medium ?? "",
    utm_campaign: c.utm.campaign ?? "",
    utm_content: c.utm.content ?? "",
    utm_term: c.utm.term ?? "",
    referrer: c.referrer,
    form_location: c.formLocation,
    brevo_synced: "FALSE",
    unsubscribed_at: c.unsubscribedAt ?? "",
  };
  return COLUMNS.map((k) => v[k]);
}

/** Додає контакт рядком у кінець аркуша. Повертає номер рядка. */
export async function appendContact(c: Contact): Promise<number> {
  await ensureHeader();
  const range = encodeURIComponent(`${SHEET_TAB}!A:${LAST_COL}`);
  // RAW — щоб введене людьми (ім'я з Telegram тощо) не виконувалося як формула.
  const res = await api<{ updates: { updatedRange: string } }>(
    `/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [toRow(c)] }) },
  );
  const m = res.updates.updatedRange.match(/!A(\d+):/);
  return m ? Number(m[1]) : 0;
}

/** Оновлює одну клітинку рядка за назвою колонки. */
export async function updateCell(row: number, column: (typeof COLUMNS)[number], value: string) {
  const col = String.fromCharCode(65 + COLUMNS.indexOf(column));
  const range = encodeURIComponent(`${SHEET_TAB}!${col}${row}`);
  await api(`/values/${range}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [[value]] }),
  });
}

/** Назви аркушів у таблиці — для діагностики. */
export async function sheetTitles(): Promise<string[]> {
  const d = await api<{ properties: { title: string }; sheets: { properties: { title: string } }[] }>(
    "?fields=properties.title,sheets.properties.title",
  );
  return d.sheets.map((s) => s.properties.title);
}
