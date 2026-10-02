import { content } from "@/content/uk";
import { config } from "@/lib/config";
import { Logo } from "./Logo";

export function Header() {
  const n = content.nav;
  const link = "hidden rounded-full px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper-2 md:inline-flex";
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label="Крук — на головну">
          <Logo />
        </a>
        <nav className="flex items-center gap-1">
          <a href={config.tgChannelUrl || "#"} target="_blank" rel="noopener" className={link}>
            {n.knowledge}
          </a>
          <a href="/crowbert" className={link}>
            {n.crowbert}
          </a>
          <a href="/#partners" className={link}>
            {n.partners}
          </a>
          <a
            href="/#waitlist"
            className="ml-2 inline-flex min-h-11 items-center rounded-full bg-orange px-5 text-sm font-semibold text-ink transition hover:bg-orange-hover"
          >
            {n.cta}
          </a>
        </nav>
      </div>
    </header>
  );
}
