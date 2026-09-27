import type { Utm } from "./utm";

export type WaitlistRequest = {
  email: string;
  consent: boolean;
  website?: string; // honeypot
  turnstileToken?: string;
  location: "hero" | "footer";
  utm?: Utm;
  referrer?: string;
  eventId?: string;
};

export type WaitlistStatus =
  | "ok"
  | "duplicate"
  | "captcha_failed"
  | "invalid_email"
  | "disposable_email"
  | "consent_required"
  | "rate_limited"
  | "unavailable";

export type WaitlistResponse = { status: WaitlistStatus; field?: "email" | "consent" };
