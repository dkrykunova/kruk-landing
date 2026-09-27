// Перевірка email — спільна для браузера і сервера.

const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

// Короткий список одноразових доменів; за потреби розширити.
const DISPOSABLE = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
]);

const TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.ru": "gmail.com",
  "ukr.nte": "ukr.net",
  "ukr.ne": "ukr.net",
  "urk.net": "ukr.net",
  "ukrnet.net": "ukr.net",
  "icluod.com": "icloud.com",
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "yahoo.co": "yahoo.com",
};

export type EmailError = "required" | "invalid" | "disposable";

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmail(raw: string): EmailError | null {
  const email = normalizeEmail(raw);
  if (!email) return "required";
  if (email.length > 254 || !EMAIL_RE.test(email)) return "invalid";
  const domain = email.split("@")[1];
  if (DISPOSABLE.has(domain)) return "disposable";
  return null;
}

/** Повертає виправлений email, якщо домен схожий на поширену помилку. */
export function suggestEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const fixed = TYPOS[email.slice(at + 1)];
  return fixed ? `${email.slice(0, at)}@${fixed}` : null;
}
