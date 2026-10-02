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

export function sendMessage(chatId: number | string, text: string, keyboard?: Keyboard) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    ...(keyboard && { reply_markup: keyboard }),
  });
}

/** Пост з картинками: одна — фото з підписом, кілька — альбом (підпис на першій). */
export function sendPhotos(chatId: number | string, photos: string[], caption: string) {
  if (photos.length === 1) return tg("sendPhoto", { chat_id: chatId, photo: photos[0], caption, parse_mode: "HTML" });
  return tg("sendMediaGroup", {
    chat_id: chatId,
    media: photos.map((url, i) => ({ type: "photo", media: url, ...(i === 0 && { caption, parse_mode: "HTML" }) })),
  });
}
