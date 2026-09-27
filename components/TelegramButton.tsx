"use client";

import { content } from "@/content/uk";
import { config } from "@/lib/config";
import { track } from "@/lib/analytics";

// Етап 2: додати ?start=<token> з UTM (POST /api/telegram/start-token).
export function TelegramButton({ location }: { location: "hero" | "footer" }) {
  const href = config.tgBotUsername ? `https://t.me/${config.tgBotUsername}` : "#";
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
