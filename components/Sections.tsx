import { content } from "@/content/uk";
import { SectionTitle } from "./SectionTitle";

const wrap = "mx-auto max-w-6xl px-4 sm:px-6";

export function HowItWorks() {
  const s = content.how;
  return (
    <section className="py-16 lg:py-24">
      <div className={wrap}>
        <SectionTitle title={s.title} />
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {s.steps.map((step, i) => (
            <li key={step.title} className="rounded-3xl border border-line bg-white p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-lilac text-lg font-extrabold text-ink">
                {i + 1}
              </span>
              <h3 className="mt-5 text-xl font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-ink-2">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Agents() {
  const s = content.agents;
  return (
    <section className="bg-ink py-16 text-paper lg:py-24">
      <div className={wrap}>
        <SectionTitle title={s.title} subtitle={s.subtitle} light />
      </div>
      {/* Мобільний: горизонтальний скрол зі snap; десктоп: сітка */}
      <ul className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 md:mx-auto md:grid md:max-w-6xl md:grid-cols-3 md:overflow-visible">
        {s.items.map((a) => (
          <li
            key={a.name}
            className="w-[78%] shrink-0 snap-start rounded-3xl border border-paper/10 bg-ink-2 p-6 md:w-auto"
          >
            <span className="inline-block rounded-full bg-butter px-3 py-1 text-sm font-bold text-ink">
              {a.name}
            </span>
            <p className="mt-4 text-paper/85">{a.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Platforms() {
  const s = content.platforms;
  return (
    <section className="py-16 lg:py-24">
      <div className={wrap}>
        <SectionTitle title={s.title} />
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {s.primary.map((p) => (
            <li
              key={p}
              className="flex min-h-24 items-center justify-center rounded-3xl border border-line bg-white text-xl font-extrabold text-ink"
            >
              {p}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-ink-2">
          <span className="font-semibold text-ink">{s.secondaryLabel}:</span> {s.secondary.join(" · ")}
        </p>
      </div>
    </section>
  );
}

export function Audience() {
  const s = content.audience;
  return (
    <section className="bg-paper-2 py-16 lg:py-24">
      <div className={wrap}>
        <SectionTitle title={s.title} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {s.items.map((a) => (
            <li key={a.title} className="rounded-3xl bg-white p-6">
              <h3 className="text-xl font-bold text-ink">{a.title}</h3>
              <p className="mt-2 text-ink-2">{a.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function WhyUkraine() {
  const s = content.ukraine;
  return (
    <section className="py-16 lg:py-24">
      <div className={wrap}>
        <div className="rounded-[2rem] bg-lilac p-6 sm:p-10">
          <SectionTitle title={s.title} />
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {s.items.map((i) => (
              <li key={i.title}>
                <h3 className="text-xl font-bold text-ink">{i.title}</h3>
                <p className="mt-2 text-ink/80">{i.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
