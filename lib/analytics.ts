// Аналітика: GA4 (gtag) вмикається лише після згоди на cookies (components/Consent.tsx).

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";
export const CONSENT_KEY = "kruk-consent";
export const CONSENT_EVENT = "kruk-consent";
export type ConsentChoice = "granted" | "denied";

export function readConsent(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {}
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

// Без згоди подія нікуди не надсилається.
export function track(event: string, params: Params = {}): void {
  try {
    if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
    window.gtag?.("event", event, params);
  } catch {}
}
