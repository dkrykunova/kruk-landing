"use client";

import { useEffect, useState } from "react";
import { content } from "@/content/uk";
import { config } from "@/lib/config";
import { track } from "@/lib/analytics";
import { captureUtm, readUtm } from "@/lib/utm";

const botUrl = config.tgBotUsername ? `https://t.me/${config.tgBotUsername}` : "#";

// Під час завантаження отримуємо токен з UTM → t.me/<bot>?start=<token>.
// Якщо токен не отримано, посилання веде в бот без нього (джерело direct).
export function TelegramButton({ location }: { location: "hero" | "footer" }) {
  const [href, setHref] = useState(botUrl);

  useEffect(() => {
    if (!config.tgBotUsername) return;
    captureUtm();
    const { utm, referrer } = readUtm();
    let cancelled = false;
    fetch("/api/telegram/start-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utm, referrer, location }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { token?: string } | null) => {
        if (!cancelled && d?.token) setHref(`${botUrl}?start=${d.token}`);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [location]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => track("tg_click", { form_location: location })}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-telegram px-6 font-semibold text-white transition hover:bg-telegram-deep sm:w-auto"
    >
      <TelegramIcon />
      {content.form.telegram}
    </a>
  );
}

export function TelegramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M21.9 4.6 18.8 19.3c-.2 1-.8 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.2.2-.5.5-1 .5l.3-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.8 13.2 2.2 11.8c-1-.3-1-1 .2-1.5L20.5 3.3c.8-.3 1.6.2 1.4 1.3Z" />
    </svg>
  );
}
