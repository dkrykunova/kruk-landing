import { company, content } from "@/content/uk";
import { config } from "./config";

export const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Крук",
    legalName: company.legalName,
    url: config.siteUrl,
    email: company.email,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  },
];
