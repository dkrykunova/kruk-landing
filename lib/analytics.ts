// Обгортка подій аналітики. Етап 3: GA4 (gtag) + Meta Pixel після згоди на cookies.

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Params = {}): void {
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...params });
    if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
  } catch {}
}
