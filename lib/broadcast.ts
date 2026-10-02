// Розсилка прогріву в канал і бот. Викликається щохвилини з Cloudflare Cron.
// Безкоштовний Workers: ≤50 зовнішніх запитів за виклик — тому партіями.
import "server-only";

import { broadcasts, type Broadcast } from "@/content/broadcasts";
import { config } from "./config";
import { updateCell, sheetsEnabled } from "./sheets";
import {
  broadcastReady,
  broadcastsEnabled,
  claimOnce,
  contactKey,
  markBotSent,
  patchContact,
  pendingBotRecipients,
  queueSheetSync,
  releaseClaim,
  unsubscribeTg,
} from "./store";
import { sendMessage } from "./telegram";

const BATCH = 15; // підписників за один виклик
const MAX_LATE = 12 * 3600_000; // не надсилати, якщо запізнилися більше ніж на 12 год

const fill = (text: string, promo = "") =>
  text.replaceAll("{{SIGNUP_URL}}", config.platformSignupUrl).replaceAll("{{PROMO_CODE}}", promo);

/** Чи можна вже надсилати: немає заглушок, виконані вимоги. */
async function isSendable(b: Broadcast): Promise<string | null> {
  if (b.paused) return `призупинено: ${b.paused}`;
  const texts = [b.channel, b.bot].filter(Boolean).join("\n");
  if (/\[[А-ЯІЇЄҐA-Z][^\]]*\]/.test(texts)) return "у тексті лишилась заглушка [...]";
  if (b.requires?.includes("signupUrl") && !config.platformSignupUrl) return "немає PLATFORM_SIGNUP_URL";
  if (b.requires?.length && !(await broadcastReady(b.id))) return "не позначено як готове";
  return null;
}

/** dry — лише показати, що було б надіслано (нічого не надсилає і не позначає). */
export async function runBroadcasts(now = Date.now(), dry = false) {
  const enabled = await broadcastsEnabled();
  if (!enabled && !dry) return { enabled: false };
  const report: Record<string, string> = {};

  for (const b of broadcasts) {
    const at = Date.parse(b.sendAt);
    if (Number.isNaN(at) || Number.isNaN(now) || now < at || now - at > MAX_LATE) continue;

    const blocked = await isSendable(b);
    if (blocked) {
      report[b.id] = `очікує: ${blocked}`;
      continue;
    }

    if (dry) {
      const recipients = b.bot ? await pendingBotRecipients(b.id, 1000) : [];
      report[b.id] = `готово: канал ${b.channel ? "так" : "ні"}, бот → ${recipients.length} підписників`;
      continue;
    }

    if (b.channel && (await claimOnce(`broadcast:${b.id}:channel`))) {
      try {
        await sendMessage(config.tgChannelUrl.replace("https://t.me/", "@"), fill(b.channel));
        report[b.id] = "канал ✓";
      } catch (e) {
        await releaseClaim(`broadcast:${b.id}:channel`);
        report[b.id] = `канал ✗ ${(e as Error).message}`;
      }
    }

    if (b.bot) {
      const recipients = await pendingBotRecipients(b.id, BATCH);
      const done: number[] = [];
      for (const c of recipients) {
        try {
          await sendMessage(c.tgId!, fill(b.bot, c.promoCode));
          done.push(c.tgId!);
          if (b.bot.includes("{{PROMO_CODE}}")) {
            const sentAt = new Date().toISOString();
            await patchContact(contactKey(c), { promoSentAt: sentAt });
            if (c.sheetRow && sheetsEnabled()) await updateCell(c.sheetRow, "promo_sent_at", sentAt);
          }
        } catch (e) {
          const code = (e as Error & { code?: number }).code;
          if (code === 403) {
            // Людина заблокувала бота — відписуємо й більше не пробуємо.
            await unsubscribeTg(c.tgId!);
            await queueSheetSync(contactKey(c));
            done.push(c.tgId!);
          } else if (code === 429) {
            break; // ліміт Telegram — продовжимо наступної хвилини
          }
        }
      }
      await markBotSent(b.id, done);
      report[b.id] = `${report[b.id] ?? ""} бот +${done.length}`.trim();
    }
  }
  return { enabled, dry, report };
}
