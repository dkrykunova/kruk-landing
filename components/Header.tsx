import { content } from "@/content/uk";
import { config } from "@/lib/config";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const n = content.nav;
  const items = [
    { href: "/znannya", label: n.knowledge },
    { href: "/crowbert", label: n.crowbert },
    { href: "/partnery", label: n.partners },
    { href: "/pro-kruk", label: n.about },
  ];
  const link = "rounded-full px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper-2";
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label="Крук — на головну">
          <Logo />
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {items.map((i) => (
            <a key={i.href} href={i.href} className={link}>
              {i.label}
            </a>
          ))}
          <a
            href="/#waitlist"
            className="ml-2 inline-flex min-h-11 items-center rounded-full bg-orange px-5 text-sm font-semibold text-ink transition hover:bg-orange-hover"
          >
            {n.cta}
          </a>
        </nav>
        <MobileMenu
          items={[
            ...items,
            { href: "/partnery/staty-partnerom", label: content.partners.cta },
            ...(config.tgChannelUrl ? [{ href: config.tgChannelUrl, label: content.footer.channel, external: true }] : []),
          ]}
          cta={{ href: "/#waitlist", label: n.cta }}
        />
      </div>
    </header>
  );
}
