// Прив'язує бота до робочого сайту: npm run tg:webhook [-- https://kruk.marketing]
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const site = process.argv[2] ?? env.NEXT_PUBLIC_SITE_URL;
const API = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}`;

const res = await fetch(`${API}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: `${site}/api/telegram/webhook`,
    secret_token: env.TG_WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query", "my_chat_member"],
    drop_pending_updates: false,
  }),
});
console.log("setWebhook:", await res.json());
console.log("getWebhookInfo:", (await (await fetch(`${API}/getWebhookInfo`)).json()).result);
