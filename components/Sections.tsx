import { content, crowbertPlans, partnerCategories } from "@/content/uk";
import { config } from "@/lib/config";
import { SectionTitle } from "./SectionTitle";

const wrap = "mx-auto max-w-6xl px-4 sm:px-6";
const channel = () => config.tgChannelUrl || "#";

export function Pillars() {
  const s = content.pillars;
  const href: Record<string, string> = { knowledge: channel(), crowbert: "/crowbert", partners: "#partners" };
  return (
    <section className="py-16 lg:py-24">
      <div className={wrap}>
        <SectionTitle title={s.title} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {s.items.map((p) => (
            <li key={p.id} className="flex flex-col rounded-3xl border border-line bg-white p-6">
              <h3 className="text-xl font-bold text-ink">{p.name}</h3>
              <p className="mt-2 flex-1 text-ink-2">{p.text}</p>
              <a
                href={href[p.id]}
                {...(p.id === "knowledge" ? { target: "_blank", rel: "noopener" } : {})}
                className="mt-5 font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 hover:text-orange-ink"
              >
                {p.link} →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function KnowledgePreview() {
  const s = content.knowledge;
  return (
    <section className="bg-paper-2 py-16 lg:py-24">
      <div className={wrap}>
        <SectionTitle title={s.title} subtitle={s.subtitle} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {s.items.map((k) => (
            <li key={k.title}>
              <a
                href={channel()}
                target="_blank"
                rel="noopener"
                className="flex h-full flex-col rounded-3xl bg-white p-6 transition hover:-translate-y-0.5"
              >
                <span className="self-start rounded-full bg-lilac px-3 py-1 text-sm font-semibold text-ink">{k.tag}</span>
                <h3 className="mt-4 text-xl font-bold leading-snug text-ink">{k.title}</h3>
                <p className="mt-2 text-ink-2">{k.text}</p>
              </a>
            </li>
          ))}
        </ul>
        <a
          href={channel()}
          target="_blank"
          rel="noopener"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper transition hover:bg-ink-2"
        >
          {s.cta}
        </a>
      </div>
    </section>
  );
}

export function CrowbertBlock() {
  const s = content.crowbert;
  return (
    <section id="crowbert" className="bg-ink py-16 text-paper lg:py-24">
      <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start`}>
        <div>
          <span className="inline-block rounded-full bg-butter px-3 py-1 text-sm font-semibold text-ink">{s.eyebrow}</span>
          <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            {s.title} <span className="italic text-orange">{s.titleAccent}</span>
          </h2>
          <p className="mt-5 text-lg text-paper/80">{s.text}</p>
          <ul className="mt-6 space-y-2">
            {s.features.map((f) => (
              <li key={f} className="flex gap-3 text-paper/90">
                <span className="text-butter" aria-hidden>
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/go/crowbert?from=home"
              className="inline-flex min-h-12 items-center rounded-full bg-orange px-6 font-semibold text-ink transition hover:bg-orange-hover"
            >
              {s.cta}
            </a>
            <a
              href="/crowbert"
              className="inline-flex min-h-12 items-center rounded-full border border-paper/30 px-6 font-semibold text-paper transition hover:border-paper"
            >
              {s.more}
            </a>
          </div>
        </div>
        <CrowbertPlans />
      </div>
    </section>
  );
}

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

export function PartnersBlock() {
  const s = content.partners;
  return (
    <section id="partners" className="scroll-mt-20 py-16 lg:py-24">
      <div className={wrap}>
        <SectionTitle title={s.title} subtitle={s.subtitle} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partnerCategories.map((c) => (
            <li key={c.id} className="rounded-3xl border border-line bg-white p-6">
              <span className="inline-block rounded-full bg-paper-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-3">
                {s.soon}
              </span>
              <h3 className="mt-4 text-xl font-bold text-ink">{c.name}</h3>
              <p className="mt-2 text-ink-2">{c.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-4 rounded-[2rem] bg-lilac p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xl font-bold text-ink">{s.ctaTitle}</p>
            <p className="mt-1 text-ink">{s.ctaText}</p>
          </div>
          <a
            href="/partnery/staty-partnerom"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-ink px-6 font-semibold text-paper transition hover:bg-ink-2"
          >
            {s.cta}
          </a>
        </div>
      </div>
    </section>
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
