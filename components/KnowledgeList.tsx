"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { slug: string; title: string; type: string; typeLabel: string; topics: string[]; excerpt: string; date: string; minutes: number };
type Opt = { value: string; label: string };

const fmt = (d: string) => new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", timeZone: "Europe/Kyiv" }).format(new Date(d));

export function KnowledgeList({ items, types, topics }: { items: Item[]; types: Opt[]; topics: Opt[] }) {
  const [type, setType] = useState("");
  const [topic, setTopic] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (types.some((t) => t.value === q.get("type"))) setType(q.get("type")!);
    if (topics.some((t) => t.value === q.get("topic"))) setTopic(q.get("topic")!);
  }, [types, topics]);
  const shown = useMemo(
    () => items.filter((i) => (!type || i.type === type) && (!topic || i.topics.includes(topic))),
    [items, type, topic],
  );
  const chip = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-ink text-paper" : "border border-line bg-white text-ink hover:border-ink-3"}`;

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Тип матеріалу">
          <button type="button" className={chip(!type)} onClick={() => setType("")} aria-pressed={!type}>Усі</button>
          {types.map((t) => (
            <button key={t.value} type="button" className={chip(type === t.value)} onClick={() => setType(t.value)} aria-pressed={type === t.value}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Тема">
          <button type="button" className={chip(!topic)} onClick={() => setTopic("")} aria-pressed={!topic}>Усі теми</button>
          {topics.map((t) => (
            <button key={t.value} type="button" className={chip(topic === t.value)} onClick={() => setTopic(t.value)} aria-pressed={topic === t.value}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-ink-2">Тут ще порожньо — матеріали на цю тему з'являться незабаром.</p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <li key={a.slug}>
              <a href={`/znannya/${a.slug}`} className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 transition hover:-translate-y-0.5">
                <span className="self-start rounded-full bg-lilac px-3 py-1 text-sm font-semibold text-ink">{a.typeLabel}</span>
                <h2 className="mt-4 text-xl font-bold leading-snug text-ink">{a.title}</h2>
                <p className="mt-2 flex-1 text-ink-2">{a.excerpt}</p>
                <p className="mt-4 text-sm text-ink-3">
                  {a.date && fmt(a.date)} · {a.minutes} хв
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
