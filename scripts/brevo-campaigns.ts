// Email-кампанії прогріву в Brevo з content/broadcasts.ts.
//   node scripts/brevo-campaigns.ts draft               — створити/оновити чернетки (нічого не надсилає)
//   node scripts/brevo-campaigns.ts schedule            — запланувати готові кампанії на їхні дати
//   node scripts/brevo-campaigns.ts status              — показати стан кампаній
import { readFileSync } from "node:fs";
import { broadcasts } from "../content/broadcasts.ts";
import { company } from "../content/uk.ts";
import { esc, renderEmail } from "../lib/email-template.ts";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const SIGNUP = env.NEXT_PUBLIC_PLATFORM_SIGNUP_URL ?? "";
const PREFIX = "Крук · прогрів · ";

async function brevo(path: string, init: RequestInit = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://api.brevo.com/v3${path}`, {
      ...init,
      headers: { "api-key": env.BREVO_API_KEY, accept: "application/json", "content-type": "application/json" },
    });
    if (res.ok) return res.status === 204 ? null : res.json();
    if (attempt < 3 && (res.status === 401 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(`${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

const footerHtml = `Ви отримали цей лист, бо записалися в лист очікування на kruk.marketing.<br><a href="{{ unsubscribe }}" style="color:#5e4a78">Відписатися</a> · © 2026 ${esc(company.legalName)}`;

const items = broadcasts.filter((b) => b.email).map((b) => {
  const e = b.email!;
  const placeholder = /\[[А-ЯІЇЄҐA-Z][^\]]*\]/.test(e.body) || (e.cta?.url.includes("{{SIGNUP_URL}}") && !SIGNUP);
  const cta = e.cta ? { ...e.cta, url: e.cta.url.replace("{{SIGNUP_URL}}", SIGNUP || "https://kruk.marketing") } : undefined;
  return {
    b,
    name: `${PREFIX}${b.id}`,
    ready: !placeholder,
    payload: {
      name: `${PREFIX}${b.id}`,
      subject: e.subject,
      previewText: e.preheader,
      sender: { name: "Крук", email: "hello@kruk.marketing" },
      replyTo: company.email,
      recipients: { listIds: [Number(env.BREVO_LIST_ID)] },
      htmlContent: renderEmail({ title: e.subject, preheader: e.preheader, body: e.body, cta, footerHtml }),
    },
  };
});

async function existing() {
  const all: { id: number; name: string; status: string; scheduledAt?: string }[] = [];
  for (const status of ["draft", "queued", "sent", "suspended", "inProcess"]) {
    const d = await brevo(`/emailCampaigns?status=${status}&limit=100`);
    all.push(...(d?.campaigns ?? []));
  }
  return new Map(all.filter((c) => c.name.startsWith(PREFIX)).map((c) => [c.name, c]));
}

const cmd = process.argv[2] ?? "status";
const found = await existing();

if (cmd === "draft") {
  for (const it of items) {
    const c = found.get(it.name);
    if (c && c.status !== "draft") {
      console.log(`${it.name}: ${c.status} — не чіпаю`);
      continue;
    }
    if (c) await brevo(`/emailCampaigns/${c.id}`, { method: "PUT", body: JSON.stringify(it.payload) });
    else await brevo("/emailCampaigns", { method: "POST", body: JSON.stringify(it.payload) });
    console.log(`${it.name}: чернетку ${c ? "оновлено" : "створено"}${it.ready ? "" : " (потрібні матеріали)"}`);
  }
} else if (cmd === "schedule") {
  for (const it of items) {
    const c = found.get(it.name);
    if (!c) { console.log(`${it.name}: немає чернетки — спершу draft`); continue; }
    if (!it.ready) { console.log(`${it.name}: пропускаю — ще є заглушки`); continue; }
    if (c.status !== "draft") { console.log(`${it.name}: уже ${c.status}`); continue; }
    if (Date.parse(it.b.sendAt) < Date.now()) { console.log(`${it.name}: дата минула — пропускаю`); continue; }
    await brevo(`/emailCampaigns/${c.id}`, { method: "PUT", body: JSON.stringify({ scheduledAt: it.b.sendAt }) });
    console.log(`${it.name}: заплановано на ${it.b.sendAt}`);
  }
}
const now = await existing();
for (const it of items) {
  const c = now.get(it.name);
  console.log(`  ${it.b.sendAt.slice(0, 10)}  ${c ? `#${c.id} ${c.status}${c.scheduledAt ? " → " + c.scheduledAt : ""}` : "—"}  ${it.ready ? "" : "⚠ заглушки"}`);
}
