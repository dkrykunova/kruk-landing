"use client";

import { useState } from "react";

// Кнопка «Поділитися в сторіз»: малює в браузері картинку 1080×1920 у стилі брендбука
// (заголовок Nyght Serif, логотип «крук.», капсула з адресою — без дрібних службових написів)
// і відкриває системне меню «Поділитися» (на телефоні там є Instagram → Сторіз).
// Посилання на статтю одночасно копіюється — його додають у сторіз стікером «Посилання».

const W = 1080, H = 1920, M = 96, SAFE = 250;
const THEMES = [
  { bg: "#23003f", text: "#fffdf0", logo: "#fffdf0", dot: "#f94500", pill: "#f94500", pillText: "#23003f" },
  { bg: "#fffdf0", text: "#23003f", logo: "#23003f", dot: "#f94500", pill: "#f94500", pillText: "#23003f" },
  { bg: "#bcacce", text: "#23003f", logo: "#23003f", dot: "#23003f", pill: "#23003f", pillText: "#fffdf0" },
  { bg: "#fffdb4", text: "#23003f", logo: "#23003f", dot: "#f94500", pill: "#23003f", pillText: "#fffdb4" },
];

function fontVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// Нерозривні пробіли після одно- й дволітерних слів і перед тире — як у візуалах для соцмереж.
const typo = (s: string) =>
  s.replace(/(^| )([«„]?[А-ЯІЇЄҐа-яіїєґA-Za-z]{1,2}) /g, "$1$2 ").replace(/(^| )([«„]?[А-ЯІЇЄҐа-яіїєґA-Za-z]{1,2}) /g, "$1$2 ").replace(/ —/g, " —");

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

async function render(title: string, theme: number, host: string): Promise<Blob> {
  const th = THEMES[theme % THEMES.length];
  const serif = fontVar("--font-nyght", "Georgia, serif");
  const sans = fontVar("--font-commissioner", "system-ui, sans-serif");
  await Promise.all([document.fonts.load(`500 100px ${serif}`, title), document.fonts.load(`800 60px ${sans}`, "крук"), document.fonts.load(`600 40px ${sans}`, host)]);

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, 0, W, H);

  // Заголовок: найбільший кегль, що вміщається в зону між верхньою безпечною зоною й капсулою.
  const text = typo(title);
  const top = SAFE + 170, maxH = H - SAFE - 420 - top;
  let size = 124, lines: string[] = [];
  for (; size >= 64; size -= 4) {
    ctx.font = `500 ${size}px ${serif}`;
    lines = wrap(ctx, text, W - 2 * M);
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (lines.length * size * 1.08 <= maxH && widest <= W - 2 * M) break;
  }
  ctx.fillStyle = th.text;
  ctx.textBaseline = "alphabetic";
  lines.forEach((l, i) => ctx.fillText(l, M, top + size + i * size * 1.08));

  // Капсула з адресою
  const pillSize = 40;
  ctx.font = `600 ${pillSize}px ${sans}`;
  const label = `Читати на ${host}`;
  const pw = ctx.measureText(label).width + pillSize * 1.8, ph = pillSize * 2.4, py = H - SAFE - 260;
  ctx.fillStyle = th.pill;
  ctx.beginPath();
  ctx.roundRect(M, py, pw, ph, ph / 2);
  ctx.fill();
  ctx.fillStyle = th.pillText;
  ctx.textBaseline = "middle";
  ctx.fillText(label, M + pillSize * 0.9, py + ph / 2 + 2);

  // Логотип «крук.»
  const ls = 64;
  ctx.textBaseline = "alphabetic";
  ctx.font = `800 ${ls}px ${sans}`;
  ctx.letterSpacing = `${-0.025 * ls}px`;
  ctx.fillStyle = th.logo;
  ctx.fillText("крук", M, H - SAFE);
  const lw = ctx.measureText("крук").width;
  ctx.fillStyle = th.dot;
  ctx.fillText(".", M + lw, H - SAFE);

  return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"));
}

export function StoryShare({ url, title, slug, theme, className }: { url: string; title: string; slug: string; theme: number; className?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "shared" | "downloaded">("idle");

  async function onClick() {
    setState("busy");
    const storyUrl = `${url}?utm_source=instagram&utm_medium=story_share&utm_campaign=reader_share`;
    try {
      await navigator.clipboard?.writeText(storyUrl).catch(() => {});
      const blob = await render(title, theme, new URL(url).host);
      const file = new File([blob], `kruk-${slug}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
        } catch (e) {
          if ((e as Error).name === "AbortError") return setState("idle");
          throw e;
        }
        return setState("shared");
      }
      // Комп'ютер або браузер без обміну файлами — просто завантажуємо картинку.
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setState("downloaded");
    } catch (e) {
      console.error("[story-share]", e);
      setState("idle");
    }
  }

  return (
    <>
      <button type="button" onClick={onClick} disabled={state === "busy"} className={className}>
        {state === "busy" ? "Готуємо картинку…" : "Instagram Stories"}
      </button>
      {state === "shared" && <p className="basis-full text-sm text-ink-3">Посилання скопійовано — додайте його в сторіз стікером «Посилання».</p>}
      {state === "downloaded" && <p className="basis-full text-sm text-ink-3">Картинку завантажено, посилання скопійовано. Додайте картинку в сторіз з телефона, а посилання — стікером «Посилання».</p>}
    </>
  );
}
