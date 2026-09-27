"use client";

import { content } from "@/content/uk";
import { track } from "@/lib/analytics";
import { SectionTitle } from "./SectionTitle";

export function Faq() {
  const s = content.faq;
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionTitle title={s.title} />
        <div className="mt-10 divide-y divide-line border-y border-line">
          {s.items.map((item) => (
            <details
              key={item.id}
              className="group py-5"
              onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && track("faq_open", { question_id: item.id })}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-bold text-ink">
                {item.q}
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-paper-2 text-xl transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-ink-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
