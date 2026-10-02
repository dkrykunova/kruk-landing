import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FrontStories, Rubrics, SectionTeasers } from "@/components/Front";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { jsonLd } from "@/lib/jsonld";

export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FrontStories />
        <Rubrics />
        <SectionTeasers />
        <FinalCta />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
