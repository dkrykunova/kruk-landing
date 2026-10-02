// Разова публікація поста контент-пакета №2 у канал @kruk_ai, без деплою сайту.
// Запуск: node scripts/tg-post-p02.mjs <id>   (id — з content/tg-p02.json)
// Повторний запуск того самого id нічого не надсилає: позначка в .tg-p02-sent/.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const id = process.argv[2];
const posts = JSON.parse(readFileSync(new URL("../content/tg-p02.json", import.meta.url), "utf8"));
if (!posts[id]) throw new Error(`немає поста ${id}`);

const dir = new URL("../.tg-p02-sent/", import.meta.url);
const mark = new URL(`${id}.json`, dir);
if (existsSync(mark)) {
  console.log(`${id}: уже опубліковано — пропускаю`);
  process.exit(0);
}

const { TG_BOT_TOKEN } = JSON.parse(readFileSync(new URL("../secrets/cf-secrets.json", import.meta.url), "utf8"));
const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: "@kruk_ai", text: posts[id].text, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
});
const data = await res.json();
if (!data.ok) throw new Error(`Telegram: ${data.error_code} ${data.description}`);
mkdirSync(dir, { recursive: true });
writeFileSync(mark, JSON.stringify({ messageId: data.result.message_id, at: new Date().toISOString() }));
console.log(`${id}: опубліковано, https://t.me/kruk_ai/${data.result.message_id}`);
