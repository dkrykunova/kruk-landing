// Brevo: контакти в списку листа очікування + транзакційні листи.
import "server-only";

import { company, content } from "@/content/uk";
import { config } from "./config";
import type { Contact } from "./store";

const API = "https://api.brevo.com/v3";
const SENDER = { name: "Крук", email: "hello@kruk.marketing" };

export const brevoEnabled = () => !!process.env.BREVO_API_KEY && !!process.env.BREVO_LIST_ID;

async function brevo(path: string, body: unknown, method = "POST"): Promise<unknown> {
  // Brevo зрідка відповідає 401 «unrecognised IP» одразу після зміни налаштувань — повторюємо.
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        accept: "application/json",
        "content-type": "application/json",
        // Тести: лист проходить валідацію Brevo, але не надсилається.
        ...(process.env.BREVO_SANDBOX === "1" && path === "/smtp/email" && { "X-Sib-Sandbox": "drop" }),
      },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.status === 204 ? null : res.json().catch(() => null);
    const text = await res.text();
    if (attempt < 3 && (res.status === 401 || res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(`Brevo ${path} ${res.status}: ${text.slice(0, 200)}`);
  }
}

/** Створює або оновлює контакт і додає його в список листа очікування. */
export async function upsertBrevoContact(c: Contact): Promise<void> {
  await brevo("/contacts", {
    email: c.email,
    updateEnabled: true,
    listIds: [Number(process.env.BREVO_LIST_ID)],
    attributes: {
      PROMO_CODE: c.promoCode,
      SIGNUP_DATE: c.createdAt.slice(0, 10),
      UTM_SOURCE: c.utm.source ?? "",
      UTM_MEDIUM: c.utm.medium ?? "",
      UTM_CAMPAIGN: c.utm.campaign ?? "",
      FORM_LOCATION: c.formLocation,
    },
  });
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

function welcomeHtml(email: string): string {
  const w = content.email.welcome;
  const channel = config.tgChannelUrl
    ? `<p style="margin:24px 0 12px">${esc(w.channelText)}</p>
       <a href="${config.tgChannelUrl}" style="display:inline-block;background:#f94500;color:#23003f;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:999px">${esc(w.channelButton)}</a>`
    : "";
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(w.subject)}</title></head>
<body style="margin:0;background:#fffdf0;font-family:Arial,Helvetica,sans-serif;color:#23003f">
<span style="display:none;max-height:0;overflow:hidden">${esc(w.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e3dceb;border-radius:24px">
<tr><td style="padding:32px 32px 8px;font-size:28px;font-weight:800;letter-spacing:-0.5px">крук<span style="color:#f94500">.</span></td></tr>
<tr><td style="padding:8px 32px 32px;font-size:16px;line-height:1.55">
<h1 style="margin:8px 0 12px;font-size:30px;line-height:1.15">${esc(w.title)}</h1>
<p style="margin:0 0 20px">${esc(w.intro)}</p>
<p style="margin:0 0 8px;font-weight:700">${esc(w.whatNext)}</p>
<ol style="margin:0;padding-left:20px">${w.steps.map((s) => `<li style="margin:0 0 6px">${esc(s)}</li>`).join("")}</ol>
${channel}
</td></tr></table>
<p style="max-width:560px;margin:20px auto 0;font-size:12px;line-height:1.5;color:#5e4a78">${esc(w.footer(email))}<br>© 2026 ${esc(company.legalName)} · <a href="${config.siteUrl}/privacy" style="color:#5e4a78">Політика конфіденційності</a></p>
</td></tr></table></body></html>`;
}

function welcomeText(email: string): string {
  const w = content.email.welcome;
  return [
    w.title,
    "",
    w.intro,
    "",
    `${w.whatNext}:`,
    ...w.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    config.tgChannelUrl ? `${w.channelText} ${config.tgChannelUrl}` : "",
    "",
    w.footer(email),
  ].join("\n");
}

export async function sendWelcomeEmail(email: string): Promise<void> {
  const w = content.email.welcome;
  await brevo("/smtp/email", {
    sender: SENDER,
    to: [{ email }],
    replyTo: { email: company.email },
    subject: w.subject,
    htmlContent: welcomeHtml(email),
    textContent: welcomeText(email),
    tags: ["welcome"],
  });
}
