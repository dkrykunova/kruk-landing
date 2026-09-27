"use client";

import { useEffect, useState } from "react";
import { content } from "@/content/uk";
import { launchTime } from "@/lib/config";
import { plural } from "@/lib/plural";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const MIN = 60_000;

function parts(ms: number) {
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / HOUR),
    minutes: Math.floor((ms % HOUR) / MIN),
  };
}

export function Countdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, launchTime() - Date.now()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  // До гідратації — статичний текст того ж розміру, без стрибка верстки.
  if (left === null) {
    return <p className="h-16 text-sm font-semibold text-ink-3">{content.hero.launchStatic}</p>;
  }
  if (left === 0) return null;

  const { days, hours, minutes } = parts(left);
  const cells = [
    { n: days, label: plural(days, { one: "день", few: "дні", many: "днів" }) },
    { n: hours, label: plural(hours, { one: "година", few: "години", many: "годин" }) },
    { n: minutes, label: plural(minutes, { one: "хвилина", few: "хвилини", many: "хвилин" }) },
  ];

  return (
    <div className="flex h-16 items-center gap-3" role="timer" aria-label={content.hero.launchStatic}>
      <span className="text-sm font-semibold text-ink-3">{content.hero.launchLabel}</span>
      <div className="flex gap-2">
        {cells.map((c) => (
          <div
            key={c.label}
            className="flex min-w-16 flex-col items-center rounded-xl border border-line bg-white px-2 py-1.5"
          >
            <span className="text-xl font-extrabold tabular-nums leading-none text-ink">
              {String(c.n).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[11px] font-medium text-ink-3">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
