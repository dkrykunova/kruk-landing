// Прив'язує бота до робочого сайту: npm run tg:webhook [-- https://kruk.marketing] [--ip=1.2.3.4]
// --ip: якщо Telegram не бачить IPv4 домену (кеш DNS), вказати IPv4 Cloudflare напряму.
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const args = process.argv.slice(2);
const site = args.find((a) => a.startsWith("http")) ?? env.NEXT_PUBLIC_SITE_URL;
const ip = args.find((a) => a.startsWith("--ip="))?.slice(5);
const API = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}`;

const res = await fetch(`${API}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: `${site}/api/telegram/webhook`,
    secret_token: env.TG_WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query", "my_chat_member"],
    drop_pending_updates: false,
    ...(ip && { ip_address: ip }),
  }),
});
console.log("setWebhook:", await res.json());
console.log("getWebhookInfo:", (await (await fetch(`${API}/getWebhookInfo`)).json()).result);
