"use client";

import { content } from "@/content/uk";
import { track } from "@/lib/analytics";
import { formatUah } from "@/lib/plural";
import { SectionTitle } from "./SectionTitle";

export function Pricing() {
  const pr = content.pricing;
  return (
    <section id="pricing" className="bg-paper-2 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title={pr.title} subtitle={pr.subtitle} />
        <ul className="mt-10 grid gap-4 lg:grid-cols-3">
          {pr.plans.map((p) => {
            const dark = !!p.featured;
            return (
              <li
                key={p.id}
                className={`flex flex-col rounded-3xl p-6 sm:p-8 ${dark ? "bg-ink text-paper" : "border border-line bg-white text-ink"}`}
              >
                <p className="text-2xl font-extrabold">{p.name}</p>
                <p className={`mt-1 text-sm ${dark ? "text-paper/70" : "text-ink-3"}`}>{p.audience}</p>

                <div className="mt-6">
                  <s className={`text-lg ${dark ? "text-paper/60" : "text-ink-3"}`}>
                    {formatUah(p.price)} {pr.perMonth}
                  </s>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tight">{formatUah(p.promoPrice)} ₴</span>
                    <span className={`text-sm ${dark ? "text-paper/70" : "text-ink-3"}`}>{pr.firstMonth}</span>
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className={dark ? "text-butter" : "text-ink-2"} aria-hidden>
                        ✓
                      </span>
                      <span className={dark ? "text-paper/90" : "text-ink-2"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#waitlist"
                  onClick={() => track("pricing_cta_click", { plan: p.id })}
                  className={`mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-6 font-semibold transition ${dark ? "bg-butter text-ink hover:bg-butter-deep" : "bg-orange text-ink hover:bg-orange-hover"}`}
                >
                  {pr.cta}
                </a>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-sm text-ink-3">{pr.note}</p>
      </div>
    </section>
  );
}
