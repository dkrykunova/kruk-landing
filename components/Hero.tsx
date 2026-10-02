import { content } from "@/content/uk";
import { WaitlistForm } from "./WaitlistForm";

export function Hero() {
  const h = content.hero;
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:pb-24">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-3">
              {h.eyebrow}
            </span>
          </div>
          <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            {h.title}{" "}
            <span className="font-serif font-medium italic text-orange">{h.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{h.subtitle}</p>
        </div>

        <div id="waitlist" className="scroll-mt-24 rounded-[2rem] border border-line bg-paper-2 p-5 sm:p-7">
          <WaitlistForm location="hero" />
        </div>
      </div>
    </section>
  );
}
