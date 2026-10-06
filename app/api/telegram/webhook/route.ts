import { after, NextResponse } from "next/server";
import { content } from "@/content/uk";
import { config, isLaunched } from "@/lib/config";
import { getTgContact, readStartToken, reservePromoCode, saveTgContact, unsubscribeTg, type Contact } from "@/lib/store";
import { syncContact } from "@/lib/sync";
import { sendDocument, sendMessage, tg, type Keyboard } from "@/lib/telegram";

const t = content.bot;
const CONSENT_VERSION = "2026-10-02";
const JOIN = "join"; // callback_data: "join", "join:<token>" або "join:gift-<ключ>"
const GIFT = "gift-";

type TgUser = { id: number; first_name?: string; last_name?: string; username?: string };
type Update = {
  message?: { chat: { id: number; type: string }; from?: TgUser; text?: string };
  callback_query?: { id: string; from: TgUser; data?: string; message?: { chat: { id: number } } };
  my_chat_member?: { chat: { id: number; type: string }; new_chat_member: { status: string } };
};

const channelKb = (): Keyboard | undefined =>
  config.tgChannelUrl ? { inline_keyboard: [[{ text: t.channelButton, url: config.tgChannelUrl }]] } : undefined;

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", timeZone: "Europe/Kyiv" }).format(new Date(iso));

// Подарунок за deep link ?start=<ключ>: файл одразу, без підписки; далі — пропозиція підписатися.
async function onGift(chatId: number, key: string) {
  const gift = t.gifts[key];
  await sendDocument(chatId, `${config.siteUrl}${gift.file}`, gift.caption);
  const existing = await getTgContact(chatId);
  if (existing && !existing.unsubscribedAt) return;
  const text = `${t.giftSubscribe}\n\n${t.consentNote(`${config.siteUrl}/privacy`, `${config.siteUrl}/consent`)}`;
  return sendMessage(chatId, text, { inline_keyboard: [[{ text: t.joinButton, callback_data: `${JOIN}:${GIFT}${key}` }]] });
}

async function onStart(chatId: number, payload: string) {
  if (Object.hasOwn(t.gifts, payload)) return onGift(chatId, payload);
  if (isLaunched()) {
    const kb = config.platformSignupUrl
      ? { inline_keyboard: [[{ text: t.signupButton, url: config.platformSignupUrl }]] }
      : undefined;
    return sendMessage(chatId, t.closed, kb);
  }
  const existing = await getTgContact(chatId);
  if (existing && !existing.unsubscribedAt) return sendMessage(chatId, t.already, channelKb());

  const token = /^[A-Za-z0-9]{10}$/.test(payload) ? payload : "";
  const text = `${t.welcome}\n\n${t.consentNote(`${config.siteUrl}/privacy`, `${config.siteUrl}/consent`)}`;
  return sendMessage(chatId, text, {
    inline_keyboard: [[{ text: t.joinButton, callback_data: token ? `${JOIN}:${token}` : JOIN }]],
  });
}

async function onJoin(user: TgUser, chatId: number, data: string) {
  const existing = await getTgContact(user.id);
  if (existing && !existing.unsubscribedAt) return sendMessage(chatId, t.already, channelKb());
  if (isLaunched()) return sendMessage(chatId, t.closed);

  const token = data.split(":")[1];
  const giftKey = token?.startsWith(GIFT) ? token.slice(GIFT.length) : "";
  const ctx = giftKey
    ? Object.hasOwn(t.gifts, giftKey) ? { utm: t.gifts[giftKey].utm, referrer: "" } : undefined
    : token ? await readStartToken(token) : undefined;
  const now = new Date().toISOString();
  const contact: Contact = {
    createdAt: existing?.createdAt ?? now,
    channel: "telegram",
    email: "",
    tgId: user.id,
    tgUsername: user.username,
    tgName: [user.first_name, user.last_name].filter(Boolean).join(" "),
    consentAt: now,
    consentVersion: CONSENT_VERSION,
    promoCode: existing?.promoCode ?? (await reservePromoCode(`tg:${user.id}`)),
    utm: ctx?.utm ?? { source: "direct" },
    referrer: ctx?.referrer ?? "",
    formLocation: "bot",
    sheetRow: existing?.sheetRow,
  };
  await saveTgContact(contact);
  after(() => syncContact(contact));
  // TODO: GA4 Measurement Protocol + Meta CAPI (Lead, method: telegram)
  return sendMessage(chatId, t.joined, channelKb());
}

async function handle(u: Update) {
  if (u.callback_query) {
    const q = u.callback_query;
    await tg("answerCallbackQuery", { callback_query_id: q.id });
    if (q.data?.startsWith(JOIN) && q.message) await onJoin(q.from, q.message.chat.id, q.data);
    return;
  }

  if (u.my_chat_member) {
    // Людина заблокувала бота — вважаємо відпискою.
    if (u.my_chat_member.chat.type === "private" && u.my_chat_member.new_chat_member.status === "kicked") {
      await unsubscribeTg(u.my_chat_member.chat.id);
      const id = u.my_chat_member.chat.id;
      after(() => syncContact({ channel: "telegram", email: "", tgId: id } as Contact));
    }
    return;
  }

  const m = u.message;
  // /chatid у групі — щоб підключити групу команди для сповіщень про заявки (TEAM_TG_CHAT_ID).
  if (m && m.chat.type !== "private" && /^\/chatid(@\w+)?$/.test((m.text ?? "").trim())) {
    return sendMessage(m.chat.id, `ID цієї групи: <code>${m.chat.id}</code>`);
  }
  if (!m || m.chat.type !== "private") return;
  const [cmd, payload = ""] = (m.text ?? "").trim().split(/\s+/, 2);

  switch (cmd) {
    case "/start":
      return onStart(m.chat.id, payload);
    case "/status": {
      const c = await getTgContact(m.chat.id);
      return sendMessage(m.chat.id, c && !c.unsubscribedAt ? t.status(fmtDate(c.createdAt)) : t.notJoined);
    }
    case "/stop": {
      await unsubscribeTg(m.chat.id);
      const id = m.chat.id;
      after(() => syncContact({ channel: "telegram", email: "", tgId: id } as Contact));
      return sendMessage(m.chat.id, t.stopped);
    }
    case "/privacy":
      return sendMessage(m.chat.id, t.privacy(`${config.siteUrl}/privacy`));
    default:
      return sendMessage(m.chat.id, t.help);
  }
}

export async function POST(req: Request) {
  const secret = process.env.TG_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    await handle((await req.json()) as Update);
  } catch (e) {
    // Відповідаємо 200, щоб Telegram не повторював те саме оновлення безкінечно.
    console.error("[telegram] update failed", e);
  }
  return NextResponse.json({ ok: true });
}
