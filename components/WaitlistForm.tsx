"use client";

import { useEffect, useId, useRef, useState } from "react";
import { content } from "@/content/uk";
import { config, isLaunched } from "@/lib/config";
import { suggestEmail, validateEmail, type EmailError } from "@/lib/email";
import { track } from "@/lib/analytics";
import { captureUtm, readUtm } from "@/lib/utm";
import type { WaitlistResponse } from "@/lib/waitlist-types";
import { useTurnstile } from "@/lib/turnstile-client";
import { TelegramButton, TelegramIcon } from "./TelegramButton";

type Location = "hero" | "footer";
type State = "idle" | "submitting" | "success" | "duplicate";

const t = content.form;

const emailMessages: Record<EmailError, string> = {
  required: t.errors.emailRequired,
  invalid: t.errors.emailInvalid,
  disposable: t.errors.emailDisposable,
};

export function WaitlistForm({ location }: { location: Location }) {
  const id = useId();
  const [launched, setLaunched] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const started = useRef(false);
  const turnstile = useTurnstile();

  useEffect(() => {
    captureUtm();
    setLaunched(isLaunched());

    const el = formRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track("view_form", { form_location: location });
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [location]);

  if (launched) {
    return (
      <div className="rounded-3xl border border-line bg-white p-6 text-ink shadow-sm">
        <p className="text-2xl font-extrabold">{content.launched.title}</p>
        <a
          href={config.platformSignupUrl || "#"}
          className="mt-4 inline-flex min-h-12 items-center rounded-full bg-orange px-6 font-semibold text-ink hover:bg-orange-hover"
        >
          {content.launched.cta} →
        </a>
      </div>
    );
  }

  if (state === "success" || state === "duplicate") {
    const copy = state === "success" ? t.success : t.duplicate;
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-3xl border border-line bg-white p-6 text-ink shadow-sm"
      >
        <p className="text-2xl font-extrabold">{copy.title}</p>
        <p className="mt-2 text-ink-2">{copy.text}</p>
        <a
          href={config.tgChannelUrl || "#"}
          target="_blank"
          rel="noopener"
          onClick={() => track("tg_channel_click", { form_location: location })}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-telegram px-6 font-semibold text-white hover:bg-telegram-deep"
        >
          <TelegramIcon />
          {t.channel}
        </a>
      </div>
    );
  }

  function checkEmail(value: string): boolean {
    const err = validateEmail(value);
    setEmailError(err ? emailMessages[err] : null);
    setSuggestion(err ? null : suggestEmail(value));
    return !err;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    setFormError(null);

    const emailOk = checkEmail(email);
    const consentOk = consent;
    setConsentError(consentOk ? null : t.errors.consentRequired);
    if (!emailOk) return emailRef.current?.focus();
    if (!consentOk) return consentRef.current?.focus();

    setState("submitting");
    const eventId = crypto.randomUUID();
    const { utm, referrer } = readUtm();
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    const turnstileToken = await turnstile.getToken();
    if (turnstileToken === null) {
      setFormError(t.errors.generic);
      return setState("idle");
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, website, turnstileToken, location, utm, referrer, eventId }),
      });
      const data: WaitlistResponse = await res.json();

      switch (data.status) {
        case "ok":
          track("generate_lead", { method: "email", form_location: location, event_id: eventId });
          window.history.replaceState(null, "", "#thanks");
          return setState("success");
        case "duplicate":
          return setState("duplicate");
        case "invalid_email":
          setEmailError(t.errors.emailInvalid);
          break;
        case "disposable_email":
          setEmailError(t.errors.emailDisposable);
          break;
        case "consent_required":
          setConsentError(t.errors.consentRequired);
          break;
        case "rate_limited":
          setFormError(t.errors.rateLimited);
          break;
        default:
          setFormError(t.errors.generic);
      }
    } catch {
      setFormError(t.errors.generic);
    }
    setState("idle");
  }

  const submitting = state === "submitting";
  const dark = location === "footer";

  return (
    <div>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor={`${id}-email`} className="sr-only">
              {t.emailLabel}
            </label>
            <input
              ref={emailRef}
              id={`${id}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              onFocus={() => {
                if (!started.current) {
                  started.current = true;
                  track("form_start", { form_location: location });
                }
              }}
              onBlur={() => email && checkEmail(email)}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? `${id}-email-err` : undefined}
              className="min-h-12 w-full rounded-full border border-line bg-white px-5 text-base text-ink placeholder:text-ink-3/70 focus:border-ink-2 focus:outline-none aria-[invalid]:border-orange-ink"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange px-7 font-semibold text-ink transition hover:bg-orange-hover disabled:cursor-wait disabled:opacity-70"
          >
            {submitting && (
              <span className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden />
            )}
            {submitting ? t.submitting : t.submit}
          </button>
        </div>

        <div aria-live="polite" className="empty:hidden">
          {emailError && (
            <p id={`${id}-email-err`} className={`text-sm font-medium ${dark ? "text-butter" : "text-orange-ink"}`}>
              {emailError}
            </p>
          )}
          {suggestion && !emailError && (
            <p className={`text-sm ${dark ? "text-paper" : "text-ink-2"}`}>
              {t.suggestion(suggestion)}{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={() => {
                  setEmail(suggestion);
                  setSuggestion(null);
                }}
              >
                {t.suggestionApply}
              </button>
            </p>
          )}
        </div>

        <label className={`flex items-start gap-3 text-sm ${dark ? "text-paper" : "text-ink-2"}`}>
          <input
            ref={consentRef}
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked) setConsentError(null);
            }}
            aria-invalid={consentError ? true : undefined}
            aria-describedby={consentError ? `${id}-consent-err` : undefined}
            className="mt-0.5 size-5 shrink-0 accent-ink"
          />
          <span>
            {t.consentBefore}
            <a href="/privacy" target="_blank" className="underline underline-offset-2">
              {t.consentPrivacy}
            </a>
            {t.consentMiddle}
            <a href="/consent" target="_blank" className="underline underline-offset-2">
              {t.consentConsent}
            </a>
          </span>
        </label>
        {consentError && (
          <p id={`${id}-consent-err`} className={`text-sm font-medium ${dark ? "text-butter" : "text-orange-ink"}`}>
            {consentError}
          </p>
        )}
        {formError && (
          <p role="alert" className={`text-sm font-medium ${dark ? "text-butter" : "text-orange-ink"}`}>
            {formError}
          </p>
        )}

        <div ref={turnstile.box} className="empty:hidden" />

        <div className="hp" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </form>

      <div className={`my-4 flex items-center gap-3 text-sm ${dark ? "text-paper/70" : "text-ink-3"}`}>
        <span className={`h-px flex-1 ${dark ? "bg-paper/20" : "bg-line"}`} />
        {t.or}
        <span className={`h-px flex-1 ${dark ? "bg-paper/20" : "bg-line"}`} />
      </div>
      <TelegramButton location={location} />
    </div>
  );
}
