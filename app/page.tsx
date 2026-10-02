import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Audience, CrowbertBlock, KnowledgePreview, PartnersBlock, Pillars } from "@/components/Sections";
import { Faq } from "@/components/Faq";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { jsonLd } from "@/lib/jsonld";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Pillars />
        <KnowledgePreview />
        <CrowbertBlock />
        <PartnersBlock />
        <Audience />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
