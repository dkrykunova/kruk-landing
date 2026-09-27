"use client";

// Невидимий Cloudflare Turnstile: getToken() запускає перевірку і повертає токен.
import { useEffect, useRef } from "react";

type Turnstile = {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  execute(id: string): void;
  reset(id: string): void;
  remove(id: string): void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
    __krukTurnstile?: Promise<Turnstile>;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  window.__krukTurnstile ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => reject(new Error("turnstile script failed"));
    document.head.appendChild(s);
  });
  return window.__krukTurnstile;
}

export function useTurnstile() {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const pending = useRef<((t: string | null) => void) | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !box.current) return;
    let cancelled = false;
    loadScript()
      .then((ts) => {
        if (cancelled || !box.current || widget.current) return;
        widget.current = ts.render(box.current, {
          sitekey: SITE_KEY,
          execution: "execute",
          appearance: "interaction-only",
          language: "uk",
          callback: (token: string) => pending.current?.(token),
          "error-callback": () => pending.current?.(null),
          "timeout-callback": () => pending.current?.(null),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, []);

  /** Токен для однієї відправки; null — перевірку не пройдено або скрипт недоступний. */
  function getToken(): Promise<string | null> {
    if (!SITE_KEY) return Promise.resolve("");
    const ts = window.turnstile;
    const id = widget.current;
    if (!ts || !id) return Promise.resolve(null);
    return new Promise((resolve) => {
      const timer = setTimeout(() => finish(null), 15_000);
      function finish(t: string | null) {
        clearTimeout(timer);
        pending.current = null;
        resolve(t);
      }
      pending.current = finish;
      ts.reset(id); // токен одноразовий — кожна відправка отримує свіжий
      ts.execute(id);
    });
  }

  return { box, getToken };
}
