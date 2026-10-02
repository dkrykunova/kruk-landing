import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Faq } from "@/components/Faq";
import { Audience } from "@/components/Sections";
import { company, content } from "@/content/uk";

const a = content.about;

export const metadata: Metadata = { title: a.metaTitle, description: a.metaDescription, alternates: { canonical: "/pro-kruk" } };

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-7xl">{a.title}</h1>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-2">
            {a.paragraphs.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </section>
        <Audience />
        <Faq />
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:pb-24">
          <h2 className="font-serif text-3xl font-medium text-ink">{a.contactsTitle}</h2>
          <p className="mt-4 text-ink-2">
            {company.legalName}, ЄДРПОУ {company.edrpou}
            <br />
            {company.address}
            <br />
            <a href={`mailto:${company.email}`} className="font-semibold text-ink underline decoration-orange underline-offset-4">{company.email}</a>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
