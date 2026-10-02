"use client";

import { useEffect, useState } from "react";
import { content } from "@/content/uk";
import { CONSENT_EVENT, readConsent, saveConsent, type ConsentChoice } from "@/lib/analytics";

const t = content.cookies;

function applyConsent(c: ConsentChoice) {
  window.gtag?.("consent", "update", { analytics_storage: c });
  window.fbq?.("consent", c === "granted" ? "grant" : "revoke");
}

// Банер згоди на cookies: «Прийняти» вмикає analytics_storage для тегу Google з app/layout.tsx. Кнопка [data-cookie-settings] у футері відкриває банер знову.
export function Consent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readConsent();
    if (!choice) setOpen(true);
    const onChoice = (e: Event) => applyConsent((e as CustomEvent<ConsentChoice>).detail);
    const onSettings = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest("[data-cookie-settings]")) setOpen(true);
    };
    window.addEventListener(CONSENT_EVENT, onChoice);
    document.addEventListener("click", onSettings);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChoice);
      document.removeEventListener("click", onSettings);
    };
  }, []);

  if (!open) return null;

  const choose = (c: ConsentChoice) => {
    saveConsent(c);
    setOpen(false);
  };

  return (
    <div role="dialog" aria-label={t.title} className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:p-6">
        <p className="text-sm text-ink-2">
          {t.text}{" "}
          <a href="/privacy" className="underline underline-offset-2">{t.more}</a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose("denied")} className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold text-ink hover:border-ink-3">
            {t.deny}
          </button>
          <button type="button" onClick={() => choose("granted")} className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-paper hover:bg-ink-2">
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
