"use client";

import { useEffect, useRef, useState } from "react";

type Item = { href: string; label: string; external?: boolean };

// Мобільне меню: кнопка-«бургер» → панель з усіма розділами. Закривається по Escape, кліку на посилання чи поза панеллю.
export function MobileMenu({ items, cta }: { items: Item[]; cta: Item }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Закрити меню" : "Відкрити меню"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <div
          id="mobile-menu"
          ref={panel}
          className="fixed inset-x-0 top-16 z-50 border-b border-line bg-paper px-4 pb-6 pt-2 shadow-sm"
        >
          <nav className="flex flex-col">
            {items.map((i) => (
              <a
                key={i.href}
                href={i.href}
                {...(i.external ? { target: "_blank", rel: "noopener" } : {})}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 text-lg font-semibold text-ink"
              >
                {i.label}
              </a>
            ))}
          </nav>
          <a
            href={cta.href}
            onClick={() => setOpen(false)}
            className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-orange px-6 font-semibold text-ink"
          >
            {cta.label}
          </a>
        </div>
      )}
    </div>
  );
}
