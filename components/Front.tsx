// Головна як «обкладинка» медіа: свіжі матеріали, рубрики, анонси розділів.
import { content } from "@/content/uk";
import { listArticles, topicLabel } from "@/lib/articles";
import { TOPICS, TYPES } from "../keystatic.config";

const wrap = "mx-auto max-w-6xl px-4 sm:px-6";
const fmt = (d: string) => new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", timeZone: "Europe/Kyiv" }).format(new Date(d));

export async function FrontStories() {
  const all = await listArticles();
  const [lead, ...rest] = all;
  if (!lead) return null;
  const side = rest.slice(0, 4);
  return (
    <section className="py-10 lg:py-14">
      <div className={wrap}>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-4xl font-medium tracking-tight text-ink sm:text-5xl">{content.knowledge.title}</h2>
          <a href="/znannya" className="hidden font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 sm:inline">
            {content.knowledge.cta} →
          </a>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <a href={`/znannya/${lead.slug}`} className="flex flex-col justify-between rounded-[2rem] bg-ink p-7 text-paper transition hover:-translate-y-0.5 sm:p-10">
            <span className="self-start rounded-full bg-butter px-3 py-1 text-sm font-semibold text-ink">{lead.typeLabel}</span>
            <div className="mt-16">
              <h3 className="text-balance font-serif text-3xl font-medium leading-[1.1] sm:text-5xl">{lead.title}</h3>
              <p className="mt-4 max-w-xl text-lg text-paper/80">{lead.excerpt}</p>
              <p className="mt-6 text-sm text-paper/70">
                {lead.date && fmt(lead.date)} · {lead.minutes} хв
              </p>
            </div>
          </a>
          <ul className="grid gap-3">
            {side.map((a) => (
              <li key={a.slug}>
                <a href={`/znannya/${a.slug}`} className="flex h-full flex-col rounded-3xl border border-line bg-white p-5 transition hover:border-ink-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                    {a.typeLabel}
                    {a.topics[0] ? ` · ${topicLabel(a.topics[0])}` : ""}
                  </p>
                  <p className="mt-2 text-lg font-bold leading-snug text-ink">{a.title}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <a href="/znannya" className="mt-6 inline-block font-semibold text-ink underline decoration-orange decoration-2 underline-offset-4 sm:hidden">
          {content.knowledge.cta} →
        </a>
      </div>
    </section>
  );
}

export function Rubrics() {
  const chip = "inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 font-semibold text-ink transition hover:border-ink-3";
  return (
    <section className="pb-10 lg:pb-14">
      <div className={wrap}>
        <p className="text-sm font-semibold uppercase tracking-wider text-ink-3">{content.front.rubrics}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <a key={t.value} href={`/znannya?type=${t.value}`} className={chip}>
              {t.label}
            </a>
          ))}
          {TOPICS.map((t) => (
            <a key={t.value} href={`/znannya?topic=${t.value}`} className={chip}>
              {t.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionTeasers() {
  const c = content.crowbert;
  const p = content.partners;
  return (
    <section className="py-10 lg:py-14">
      <div className={`${wrap} grid gap-4 md:grid-cols-2`}>
        <a href="/crowbert" className="flex flex-col rounded-[2rem] bg-ink-2 p-7 text-paper transition hover:-translate-y-0.5 sm:p-10">
          <span className="self-start rounded-full bg-butter px-3 py-1 text-sm font-semibold text-ink">{c.eyebrow}</span>
          <p className="mt-8 font-serif text-3xl font-medium leading-tight sm:text-4xl">
            {c.title} <span className="italic text-orange">{c.titleAccent}</span>
          </p>
          <p className="mt-4 flex-1 text-paper/80">{content.front.crowbertTeaser}</p>
          <span className="mt-6 font-semibold underline decoration-orange decoration-2 underline-offset-4">{c.more} →</span>
        </a>
        <a href="/partnery" className="flex flex-col rounded-[2rem] bg-lilac p-7 text-ink transition hover:-translate-y-0.5 sm:p-10">
          <span className="self-start rounded-full bg-paper px-3 py-1 text-sm font-semibold text-ink">{p.soon}</span>
          <p className="mt-8 font-serif text-3xl font-medium leading-tight sm:text-4xl">{p.title}</p>
          <p className="mt-4 flex-1">{p.subtitle}</p>
          <span className="mt-6 font-semibold underline decoration-ink decoration-2 underline-offset-4">{content.front.partnersLink} →</span>
        </a>
      </div>
    </section>
  );
}
