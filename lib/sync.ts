// Перенесення контактів із Redis у Google Sheets.
// Викликається після відповіді відвідувачу (next/server after) і з cron-повтору.
import "server-only";

import { appendContact, sheetsEnabled, updateCell } from "./sheets";
import {
  contactKey,
  getContact,
  patchContact,
  pendingSheetSync,
  queueSheetSync,
  sheetSyncDone,
  type Contact,
} from "./store";

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
    }
    await sheetSyncDone(key);
  } catch (e) {
    console.error("[sheets] sync failed, queued for retry", key.slice(0, 24), (e as Error).message);
    await queueSheetSync(key);
  }
}

export const syncContact = (c: Contact) => syncToSheet(contactKey(c));

/** Повтор для контактів, які не вдалося записати раніше. */
export async function retryPendingSheetSync(): Promise<number> {
  const keys = await pendingSheetSync();
  for (const k of keys) await syncToSheet(k);
  return keys.length;
}
