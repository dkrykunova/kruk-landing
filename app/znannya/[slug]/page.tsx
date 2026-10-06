import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleBody } from "@/components/ArticleBody";
import { ShareButtons } from "@/components/ShareButtons";
import { WaitlistForm } from "@/components/WaitlistForm";
import { content, partnerCategories } from "@/content/uk";
import { getArticle, listArticles, topicLabel, typeLabel } from "@/lib/articles";
import { config } from "@/lib/config";
import { listPartners, type Partner } from "@/lib/partners";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listArticles()).map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = (await listArticles()).find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: `${a.title} — Крук`,
    description: a.excerpt,
    alternates: { canonical: `/znannya/${slug}` },
    openGraph: { title: a.title, description: a.excerpt, type: "article", url: `/znannya/${slug}`, images: [a.cover ?? "/opengraph-image.png"] },
  };
}

const fmt = (d: string) => new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Kyiv" }).format(new Date(d));

function Cta({ kind, slug, partners }: { kind: string; slug: string; partners: Partner[] }) {
  if (kind === "crowbert") {
    const c = content.crowbert;
    return (
      <div className="rounded-[2rem] bg-ink p-6 text-paper sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-butter">{c.eyebrow}</p>
        <p className="mt-3 font-serif text-3xl font-medium leading-tight">
          {c.title} <span className="italic text-orange">{c.titleAccent}</span>
        </p>
        <p className="mt-3 text-paper/80">{c.text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`/go/crowbert?from=article-${slug}`.slice(0, 80)} className="inline-flex min-h-12 items-center rounded-full bg-orange px-6 font-semibold text-ink hover:bg-orange-hover">
            {c.cta}
          </a>
          <a href="/crowbert" className="inline-flex min-h-12 items-center rounded-full border border-paper/30 px-6 font-semibold text-paper hover:border-paper">
            {c.more}
          </a>
        </div>
      </div>
    );
  }
  const cat = partnerCategories.find((c) => c.id === kind);
  if (cat) {
    return (
      <div className="rounded-[2rem] bg-lilac p-6 text-ink sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider">Партнери Крука · {cat.name}</p>
        <p className="mt-3 text-2xl font-bold">{content.partners.subtitle}</p>
        <p className="mt-2">{cat.text}</p>
        {partners.filter((x) => x.category === kind).map((x) => (
          <a key={x.slug} href={`/partnery/${x.slug}`} className="mt-4 block rounded-2xl bg-white p-4 hover:bg-paper">
            <p className="font-bold">{x.name} →</p>
            <p className="mt-1 text-sm text-ink-2">{x.tagline}</p>
          </a>
        ))}
        <a href="/partnery" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper hover:bg-ink-2">
          {content.partners.title}
        </a>
      </div>
    );
  }
  return (
    <div className="rounded-[2rem] bg-ink p-6 sm:p-8">
      <p className="font-serif text-3xl font-medium leading-tight text-paper">{content.finalCta.title}</p>
      <p className="mb-6 mt-3 text-paper/80">{content.finalCta.text}</p>
      <WaitlistForm location="footer" />
    </div>
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const data = await getArticle(slug);
  if (!data) notFound();
  const { entry, node } = data;
  const topics: string[] = [...entry.topics];
  const all = await listArticles();
  const related = all
    .filter((a) => a.slug !== slug)
    .sort((a, b) => b.topics.filter((t) => topics.includes(t)).length - a.topics.filter((t) => topics.includes(t)).length)
    .slice(0, 3);
  const url = `${config.siteUrl}/znannya/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.excerpt,
    datePublished: entry.date,
    author: entry.author.startsWith("Редакція")
      ? { "@type": "Organization", name: entry.author, url: config.siteUrl }
      : { "@type": "Person", name: entry.author },
    inLanguage: "uk",
    publisher: { "@type": "Organization", name: "Крук", url: config.siteUrl },
    mainEntityOfPage: url,
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16">
        <nav className="text-sm text-ink-3">
          <a href="/znannya" className="underline-offset-4 hover:underline">Знання</a> → {typeLabel(entry.type)}
        </nav>
        <h1 className="mt-4 text-balance font-serif text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl">{entry.title}</h1>
        <p className="mt-5 text-lg text-ink-2">{entry.excerpt}</p>
        <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-3">
          <span>{entry.author}</span>
          {entry.date && <span>· {fmt(entry.date)}</span>}
          {entry.topics.length > 0 && <span>· {entry.topics.map(topicLabel).join(", ")}</span>}
        </p>
        {entry.cover && <img src={entry.cover} alt="" className="mt-8 w-full rounded-3xl" />}
        <article className="mt-10">
          <ArticleBody node={node} />
        </article>
        <div className="mt-10">
          <ShareButtons url={url} title={entry.title} slug={slug} theme={[...slug].reduce((n, ch) => n + ch.charCodeAt(0), 0)} />
        </div>
        <div className="mt-10">
          <Cta kind={entry.cta} slug={slug} partners={await listPartners()} />
        </div>
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-3xl font-medium text-ink">Читайте також</h2>
            <ul className="mt-6 grid gap-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <a href={`/znannya/${r.slug}`} className="block rounded-2xl border border-line bg-white p-5 hover:border-ink-3">
                    <p className="font-bold text-ink">{r.title}</p>
                    <p className="mt-1 text-sm text-ink-2">{r.excerpt}</p>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
