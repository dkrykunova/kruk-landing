import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CrowbertPlans } from "@/components/Sections";
import { SectionTitle } from "@/components/SectionTitle";
import { content } from "@/content/uk";

const c = content.crowbert;
const p = content.crowbertPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.metaDescription,
  alternates: { canonical: "/crowbert" },
};

const wrap = "mx-auto max-w-6xl px-4 sm:px-6";

function Cta({ from }: { from: string }) {
  return (
    <a
      href={`/go/crowbert?from=${from}`}
      className="inline-flex min-h-12 items-center rounded-full bg-orange px-6 font-semibold text-ink transition hover:bg-orange-hover"
    >
      {c.cta}
    </a>
  );
}

export default function CrowbertPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-12 md:py-20">
          <div className={wrap}>
            <span className="inline-block rounded-full bg-lilac px-3 py-1 text-sm font-semibold text-ink">{c.eyebrow}</span>
            <h1 className="mt-6 max-w-3xl text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl">
              {c.title} <span className="font-serif font-medium italic text-orange">{c.titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">{c.text}</p>
            <div className="mt-8">
              <Cta from="crowbert-hero" />
            </div>
          </div>
        </section>

        <section className="bg-paper-2 py-16 lg:py-24">
          <div className={wrap}>
            <SectionTitle title={p.how.title} />
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {p.how.steps.map((s, i) => (
                <li key={s.title} className="rounded-3xl bg-white p-6">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-lilac text-lg font-extrabold text-ink">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-ink">{s.title}</h3>
                  <p className="mt-2 text-ink-2">{s.text}</p>
                </li>
              ))}
            </ol>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {c.features.map((f) => (
                <li key={f} className="flex gap-3 rounded-2xl bg-white p-4 text-ink-2">
                  <span className="text-orange-ink" aria-hidden>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-ink py-16 text-paper lg:py-24">
          <div className={`${wrap} max-w-3xl`}>
            <CrowbertPlans from="crowbert-page" />
            <div className="mt-8">
              <Cta from="crowbert-plans" />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionTitle title={content.faq.title} />
            <div className="mt-8 divide-y divide-line border-y border-line">
              {p.faq.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-bold text-ink">
                    {f.q}
                    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-paper-2 text-xl transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-10">
              <Cta from="crowbert-faq" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
