import { company, content } from "@/content/uk";
import { config } from "@/lib/config";
import { Logo } from "./Logo";

export function Footer() {
  const f = content.footer;
  const link = "underline-offset-4 hover:underline";
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-ink-3">
            © 2026 {company.legalName}
            <br />
            <a href={`mailto:${company.email}`} className={link}>
              {company.email}
            </a>
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm text-ink-2 md:items-end">
          <a href="/znannya" className={link}>Знання</a>
          <a href="/crowbert" className={link}>AI-агент Crowbert</a>
          <a href="/partnery" className={link}>Партнери</a>
          <a href="/pro-kruk" className={link}>Про Крук</a>
          <a href="/privacy" className={link}>{f.privacy}</a>
          <a href="/consent" className={link}>{f.consent}</a>
          <a href="/partnery/staty-partnerom" className={link}>{f.partner}</a>
          {/* Відкриває банер згоди на cookies (components/Consent.tsx) */}
          <button type="button" data-cookie-settings className={`text-left ${link}`}>{f.cookies}</button>
          {config.tgChannelUrl && (
            <a href={config.tgChannelUrl} target="_blank" rel="noopener" className={link}>{f.channel}</a>
          )}
        </nav>
      </div>
    </footer>
  );
}
