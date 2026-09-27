// Мінімальний клієнт Telegram Bot API (лише сервер).
import "server-only";

type InlineButton = { text: string; url?: string; callback_data?: string };
export type Keyboard = { inline_keyboard: InlineButton[][] };

export async function tg<T = unknown>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = process.env.TG_BOT_TOKEN;
  if (!token) throw new Error("TG_BOT_TOKEN не задано");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; result?: T; description?: string; error_code?: number };
  if (!data.ok) {
    const err = new Error(`Telegram ${method}: ${data.error_code} ${data.description}`);
    (err as Error & { code?: number }).code = data.error_code;
    throw err;
  }
  return data.result as T;
}

export function sendMessage(chatId: number, text: string, keyboard?: Keyboard) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    ...(keyboard && { reply_markup: keyboard }),
  });
}
