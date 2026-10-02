import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { content, partnerCategories } from "@/content/uk";

const s = content.partners;
const p = content.partnersPage;

export const metadata: Metadata = {
  title: p.metaTitle,
  description: p.metaDescription,
  alternates: { canonical: "/partnery" },
};

export default function PartnersPage() {
  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-7xl">{s.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-2">{p.intro}</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {partnerCategories.map((c) => (
              <li key={c.id} className="rounded-3xl border border-line bg-white p-6">
                <span className="inline-block rounded-full bg-paper-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-3">{s.soon}</span>
                <h2 className="mt-4 text-2xl font-bold text-ink">{c.name}</h2>
                <p className="mt-2 text-ink-2">{c.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-paper-2 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle title={p.how.title} />
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {p.how.steps.map((st, i) => (
                <li key={st.title} className="rounded-3xl bg-white p-6">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-lilac text-lg font-extrabold text-ink">{i + 1}</span>
                  <h3 className="mt-5 text-xl font-bold text-ink">{st.title}</h3>
                  <p className="mt-2 text-ink-2">{st.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="flex flex-col gap-4 rounded-[2rem] bg-ink p-8 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="font-serif text-3xl font-medium leading-tight">{s.ctaTitle}</p>
              <p className="mt-2 text-paper/80">{s.ctaText}</p>
            </div>
            <a href="/partnery/staty-partnerom" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-orange px-6 font-semibold text-ink transition hover:bg-orange-hover">
              {s.cta}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
