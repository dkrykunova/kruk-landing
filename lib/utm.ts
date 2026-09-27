// Збереження UTM-міток першого входу в межах візиту.

export type Utm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

const KEY = "kruk_utm";
const FIELDS = ["source", "medium", "campaign", "content", "term"] as const;

export function captureUtm(): void {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const utm: Utm = {};
    for (const f of FIELDS) {
      const v = params.get(`utm_${f}`);
      if (v) utm[f] = v.slice(0, 200);
    }
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ utm, referrer: document.referrer.slice(0, 500) }),
    );
  } catch {
    // sessionStorage недоступний (приватний режим, вбудований браузер) — не критично
  }
}

export function readUtm(): { utm: Utm; referrer: string } {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { utm: {}, referrer: typeof document !== "undefined" ? document.referrer : "" };
}
