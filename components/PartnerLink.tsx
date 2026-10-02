"use client";

// Реферальне посилання партнера: веде напряму на сайт партнера й рахує перехід.
export function PartnerLink({ href, slug, from, className, children }: { href: string; slug: string; from: string; className?: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener"
      className={className}
      onClick={() => {
        try {
          navigator.sendBeacon(`/api/click?name=${encodeURIComponent(`partner:${slug}:${from}`)}`);
        } catch {}
      }}
    >
      {children}
    </a>
  );
}
