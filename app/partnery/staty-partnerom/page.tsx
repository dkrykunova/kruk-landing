import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PartnerForm } from "@/components/PartnerForm";
import { content, partnerCategories } from "@/content/uk";

const t = content.partnerForm;

export const metadata: Metadata = { title: t.metaTitle, alternates: { canonical: "/partnery/staty-partnerom" } };

export default function BecomePartner() {
  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl">{t.title}</h1>
          <p className="mt-5 text-lg text-ink-2">{t.subtitle}</p>
          <ul className="mt-8 grid gap-3">
            {partnerCategories.map((c) => (
              <li key={c.id} className="rounded-2xl bg-paper-2 p-4">
                <p className="font-bold text-ink">{c.name}</p>
                <p className="mt-1 text-sm text-ink-2">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <PartnerForm />
      </main>
      <Footer />
    </>
  );
}
