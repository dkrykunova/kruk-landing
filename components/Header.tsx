import { content } from "@/content/uk";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" aria-label="Крук — на початок">
          <Logo />
        </a>
        <a
          href="#waitlist"
          className="inline-flex min-h-11 items-center rounded-full bg-orange px-5 text-sm font-semibold text-ink transition hover:bg-orange-hover"
        >
          {content.header.cta}
        </a>
      </div>
    </header>
  );
}
