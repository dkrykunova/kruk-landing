import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Agents, Audience, HowItWorks, Platforms, WhyUkraine } from "@/components/Sections";
import { Pricing } from "@/components/Pricing";
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
        <HowItWorks />
        <Agents />
        <Platforms />
        <Audience />
        <WhyUkraine />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
