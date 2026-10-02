// Аналітика: тег GA4 у app/layout.tsx працює в Consent Mode; повний збір — після згоди (components/Consent.tsx).

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";
export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

// Події сайту → стандартні події Meta.
const META_EVENTS: Record<string, string> = { generate_lead: "Lead", partner_application: "SubmitApplication" };
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

// Без згоди gtag надсилає подію без cookies (Consent Mode).
export function track(event: string, params: Params = {}): void {
  try {
    if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
    window.gtag?.("event", event, params);
    const meta = META_EVENTS[event];
    if (meta) window.fbq?.("track", meta, params, params.event_id ? { eventID: String(params.event_id) } : undefined);
  } catch {}
}
