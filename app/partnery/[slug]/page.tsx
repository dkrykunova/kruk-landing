import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CouponCopy } from "@/components/CouponCopy";
import { PartnerLink } from "@/components/PartnerLink";
import { content, partnerCategories } from "@/content/uk";
import { listArticles } from "@/lib/articles";
import { config } from "@/lib/config";
import { getPartner, listPartners, partnerHref } from "@/lib/partners";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listPartners()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPartner((await params).slug);
  if (!p) return {};
  const title = `${p.name} — ${p.tagline}`;
  return {
    title: `${p.name}: огляд, ціни й кому підійде — Крук`,
    description: p.summary,
    alternates: { canonical: `/partnery/${p.slug}` },
    openGraph: { title, description: p.summary, url: `/partnery/${p.slug}`, images: ["/opengraph-image.png"] },
  };
}

const fmt = (d: string) => new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Kyiv" }).format(new Date(d));
const t = content.partnerPage;

export default async function PartnerPage({ params }: Props) {
  const p = await getPartner((await params).slug);
  if (!p) notFound();
  const cat = partnerCategories.find((c) => c.id === p.category);
  const related = (await listArticles()).filter((a) => a.topics.includes(p.category)).slice(0, 3);
  const btn = "inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-6 font-semibold text-ink transition hover:bg-orange-hover";

  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16">
          <nav className="text-sm text-ink-3">
            <a href="/partnery" className="underline-offset-4 hover:underline">Партнери</a>
            {cat && <> → {cat.name}</>}
          </nav>
          <div className="mt-6 flex items-center gap-4">
            {p.logo ? (
              <img src={p.logo} alt="" className="size-16 rounded-2xl border border-line bg-white object-contain p-2" />
            ) : (
              <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-lilac font-serif text-3xl font-medium text-ink">{p.name.slice(0, 1)}</span>
            )}
            <h1 className="font-serif text-5xl font-medium leading-none tracking-tight text-ink sm:text-6xl">{p.name}</h1>
          </div>
          <p className="mt-6 text-balance font-serif text-2xl leading-snug text-ink sm:text-3xl">{p.tagline}</p>
          <p className="mt-4 max-w-2xl text-lg text-ink-2">{p.summary}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PartnerLink href={partnerHref(p, "top")} slug={p.slug} from="top" className={btn}>{p.ctaLabel} ↗</PartnerLink>
            <p className="max-w-sm text-sm text-ink-3">{t.disclosure}</p>
          </div>
        </section>

        {(p.offer || p.coupon) && (
          <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
            <div className="rounded-3xl bg-butter p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-ink">{t.offer}</h2>
              {p.offer && <p className="mt-2 text-ink">{p.offer}</p>}
              {p.coupon && <div className="mt-5"><CouponCopy code={p.coupon} /></div>}
            </div>
          </section>
        )}

        {p.about && (
          <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
            <div className="kr-article max-w-3xl">
              {p.about.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </section>
        )}

        <section className="mx-auto grid max-w-4xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-2">
          {p.forWhom.length > 0 && (
            <div className="rounded-3xl bg-butter p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-ink">{t.forWhom}</h2>
              <ul className="mt-4 space-y-3 text-ink">
                {p.forWhom.map((x) => <li key={x} className="flex gap-3"><span aria-hidden className="font-bold">✓</span><span>{x}</span></li>)}
              </ul>
            </div>
          )}
          {p.notFor.length > 0 && (
            <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-ink">{t.notFor}</h2>
              <ul className="mt-4 space-y-3 text-ink-2">
                {p.notFor.map((x) => <li key={x} className="flex gap-3"><span aria-hidden className="text-ink-3">—</span><span>{x}</span></li>)}
              </ul>
            </div>
          )}
        </section>

        {p.benefits.length > 0 && (
          <section className="bg-paper-2 py-16 lg:py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <h2 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">{t.benefits}</h2>
              <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                {p.benefits.map((b) => (
                  <li key={b.title} className="rounded-3xl bg-white p-6">
                    <h3 className="text-xl font-bold text-ink">{b.title}</h3>
                    <p className="mt-2 text-ink-2">{b.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-20">
          {p.steps.length > 0 && (
            <>
              <h2 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">{t.steps}</h2>
              <ol className="mt-8 grid gap-4">
                {p.steps.map((s, i) => (
                  <li key={s} className="flex gap-4 rounded-3xl border border-line bg-white p-6">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-lilac text-lg font-extrabold text-ink">{i + 1}</span>
                    <p className="pt-1.5 text-ink-2">{s}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {p.pricing && (
              <div className="rounded-3xl bg-white p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-ink">{t.pricing}</h2>
                <p className="mt-3 text-ink-2">{p.pricing}</p>
              </div>
            )}
            {p.good && (
              <div className="rounded-3xl bg-white p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-ink">{t.good}</h2>
                <p className="mt-3 text-ink-2">{p.good}</p>
              </div>
            )}
          </div>
          {p.checkedAt && <p className="mt-6 text-sm text-ink-3">{t.checked} {fmt(p.checkedAt)}.</p>}
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
          <div className="flex flex-col gap-5 rounded-[2rem] bg-ink p-8 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="font-serif text-3xl font-medium leading-tight">{p.name}</p>
              <p className="mt-2 text-paper/80">{p.tagline}</p>
            </div>
            <PartnerLink href={partnerHref(p, "bottom")} slug={p.slug} from="bottom" className={`${btn} shrink-0`}>{p.ctaLabel} ↗</PartnerLink>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
            <h2 className="font-serif text-3xl font-medium text-ink">{t.related}</h2>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${p.name} — ${p.tagline}`,
            description: p.summary,
            url: `${config.siteUrl}/partnery/${p.slug}`,
            inLanguage: "uk",
            about: { "@type": "Thing", name: p.name },
            publisher: { "@type": "Organization", name: "Крук", url: config.siteUrl },
            ...(p.checkedAt ? { dateModified: p.checkedAt } : {}),
          }),
        }}
      />
    </>
  );
}
