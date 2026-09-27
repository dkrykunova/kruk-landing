// Перенесення контактів із Redis у Google Sheets і Brevo.
// Викликається після відповіді відвідувачу (next/server after) і з cron-повтору.
import "server-only";

import { brevoEnabled, sendWelcomeEmail, upsertBrevoContact } from "./brevo";
import { appendContact, sheetsEnabled, updateCell } from "./sheets";
import {
  brevoSyncDone,
  contactKey,
  getContact,
  patchContact,
  pendingBrevoSync,
  pendingSheetSync,
  queueBrevoSync,
  queueSheetSync,
  sheetSyncDone,
  type Contact,
} from "./store";

const short = (key: string) => key.slice(0, 24);

/** Записує контакт у таблицю: новий рядок або оновлення наявного. */
export async function syncToSheet(key: string): Promise<void> {
  if (!sheetsEnabled()) return;
  const c = await getContact(key);
  if (!c) return sheetSyncDone(key);
  try {
    if (c.sheetRow) {
      await updateCell(c.sheetRow, "unsubscribed_at", c.unsubscribedAt ?? "");
    } else {
      const row = await appendContact(c);
      await patchContact(key, { sheetRow: row });
      if (c.brevoSyncedAt) await updateCell(row, "brevo_synced", "TRUE");
    }
    await sheetSyncDone(key);
  } catch (e) {
    console.error("[sheets] sync failed, queued for retry", short(key), (e as Error).message);
    await queueSheetSync(key);
  }
}

/** Email-контакт → список Brevo + вітальний лист (один раз). */
export async function syncToBrevo(key: string): Promise<void> {
  if (!brevoEnabled()) return;
  const c = await getContact(key);
  if (!c || c.channel !== "email" || c.unsubscribedAt) return brevoSyncDone(key);
  try {
    if (!c.brevoSyncedAt) {
      await upsertBrevoContact(c);
      const at = new Date().toISOString();
      await patchContact(key, { brevoSyncedAt: at });
      c.brevoSyncedAt = at;
    }
    if (!c.welcomeSentAt) {
      await sendWelcomeEmail(c.email);
      await patchContact(key, { welcomeSentAt: new Date().toISOString() });
    }
    const fresh = await getContact(key);
    if (fresh?.sheetRow && sheetsEnabled()) await updateCell(fresh.sheetRow, "brevo_synced", "TRUE");
    await brevoSyncDone(key);
  } catch (e) {
    console.error("[brevo] sync failed, queued for retry", short(key), (e as Error).message);
    await queueBrevoSync(key);
  }
}

/** Новий або змінений контакт: спершу таблиця (щоб знати рядок), потім Brevo. */
export async function syncContact(c: Pick<Contact, "channel" | "email" | "tgId">): Promise<void> {
  const key = contactKey(c);
  await syncToSheet(key);
  if (c.channel === "email") await syncToBrevo(key);
}

/** Повтор для контактів, які не вдалося записати раніше. */
export async function retryPendingSync(): Promise<{ sheets: number; brevo: number }> {
  const sheets = await pendingSheetSync();
  for (const k of sheets) await syncToSheet(k);
  const brevo = await pendingBrevoSync();
  for (const k of brevo) await syncToBrevo(k);
  return { sheets: sheets.length, brevo: brevo.length };
}
