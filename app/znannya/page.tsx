import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { KnowledgeList } from "@/components/KnowledgeList";
import { listArticles } from "@/lib/articles";
import { TOPICS, TYPES } from "../../keystatic.config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Знання: маркетинг і продажі для малого бізнесу — Крук",
  description: "Поради, кейси й новини з маркетингу та продажів для малого й середнього бізнесу.",
  alternates: { canonical: "/znannya" },
};

export default async function KnowledgePage() {
  const items = (await listArticles()).map(({ cover: _c, author: _a, cta: _t, ...rest }) => rest);
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-7xl">Знання</h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-2">
          Поради, кейси й новини з маркетингу та продажів для малого й середнього бізнесу. Нові матеріали — двічі на тиждень.
        </p>
        <div className="mt-10">
          <KnowledgeList items={items} types={[...TYPES]} topics={[...TOPICS]} />
        </div>
      </main>
      <Footer />
    </>
  );
}
