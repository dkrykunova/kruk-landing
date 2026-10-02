import { content, crowbertPlans } from "@/content/uk";
import { SectionTitle } from "./SectionTitle";

const wrap = "mx-auto max-w-6xl px-4 sm:px-6";

export function CrowbertPlans({ from = "home" }: { from?: string }) {
  const s = content.crowbert;
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-paper/70">{s.plansTitle}</p>
      <ul className="mt-4 grid gap-3">
        {crowbertPlans.map((p) => (
          <li
            key={p.id}
            className={`rounded-3xl p-5 ${p.featured ? "bg-butter text-ink" : "border border-paper/15 bg-ink-2 text-paper"}`}
          >
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xl font-extrabold">{p.name}</p>
                <p className={`text-sm ${p.featured ? "text-ink-3" : "text-paper/70"}`}>{p.audience}</p>
              </div>
              <p className="whitespace-nowrap">
                <span className="text-3xl font-extrabold tracking-tight">${p.price}</span>
                <span className={`text-sm ${p.featured ? "text-ink-3" : "text-paper/70"}`}>{s.perMonth}</span>
              </p>
            </div>
            <p className={`mt-3 text-sm ${p.featured ? "text-ink-2" : "text-paper/80"}`}>{p.features.join(" · ")}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-paper/70">
        {s.plansNote}{" "}
        <a href={`/go/crowbert?from=${from}-plans`} className="underline underline-offset-2 hover:text-paper">
          crowbert.com
        </a>
      </p>
    </div>
  );
}

export function Audience() {
  const s = content.audience;
  return (
    <section className="bg-paper-2 py-16 lg:py-24">
      <div className={wrap}>
        <SectionTitle title={s.title} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {s.items.map((a) => (
            <li key={a.title} className="rounded-3xl bg-white p-6">
              <h3 className="text-xl font-bold text-ink">{a.title}</h3>
              <p className="mt-2 text-ink-2">{a.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
