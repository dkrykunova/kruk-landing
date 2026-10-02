"use client";

import { useState } from "react";

// Промокод партнера з кнопкою копіювання.
export function CouponCopy({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(code).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        });
      }}
      className="inline-flex min-h-12 items-center gap-3 rounded-full border-2 border-dashed border-ink px-5 font-mono text-lg font-bold text-ink transition hover:bg-white"
    >
      {code}
      <span className="font-sans text-sm font-semibold">{done ? "Скопійовано ✓" : "Скопіювати"}</span>
    </button>
  );
}
