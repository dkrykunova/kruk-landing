"use client";

import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const btn = "inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink-3";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-ink-3">Поділитися:</span>
      <a className={btn} target="_blank" rel="noopener" href={`https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`}>Telegram</a>
      <a className={btn} target="_blank" rel="noopener" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}>Facebook</a>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {}
        }}
      >
        {copied ? "Скопійовано ✓" : "Копіювати посилання"}
      </button>
    </div>
  );
}
