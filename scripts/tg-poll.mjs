// Локальна розробка: Telegram не може достукатися до localhost,
// тож забираємо оновлення через getUpdates і передаємо їх у наш webhook-роут.
// Запуск: npm run tg:poll (паралельно з npm run dev)
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const API = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}`;
const TARGET = process.env.TARGET ?? "http://localhost:3000/api/telegram/webhook";

await fetch(`${API}/deleteWebhook`);
console.log("tg-poll: слухаю оновлення бота →", TARGET);

let offset = 0;
for (;;) {
  try {
    const res = await fetch(`${API}/getUpdates?timeout=30&offset=${offset}&allowed_updates=${encodeURIComponent('["message","callback_query","my_chat_member"]')}`);
    const { result = [] } = await res.json();
    for (const u of result) {
      offset = u.update_id + 1;
      const r = await fetch(TARGET, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Bot-Api-Secret-Token": env.TG_WEBHOOK_SECRET },
        body: JSON.stringify(u),
      });
      console.log("update", u.update_id, "→", r.status);
    }
  } catch (e) {
    console.error("tg-poll:", e.message);
    await new Promise((r) => setTimeout(r, 3000));
  }
}
