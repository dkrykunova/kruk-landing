// Brevo: контакти в списку листа очікування + транзакційні листи.
import "server-only";

import { company, content } from "@/content/uk";
import { config } from "./config";
import { esc, renderEmail } from "./email-template";
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

function welcomeHtml(email: string): string {
  const w = content.email.welcome;
  return renderEmail({
    title: w.title,
    preheader: w.preheader,
    body: [w.intro, `${w.whatNext}:\n${w.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`, config.tgChannelUrl ? w.channelText : ""]
      .filter(Boolean)
      .join("\n\n"),
    cta: config.tgChannelUrl ? { text: w.channelButton, url: config.tgChannelUrl } : undefined,
    footerHtml: `${esc(w.footer(email))}<br>© 2026 ${esc(company.legalName)} · <a href="${config.siteUrl}/privacy" style="color:#5e4a78">Політика конфіденційності</a>`,
  });
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
