import { content } from "@/content/uk";
import { WaitlistForm } from "./WaitlistForm";

export function FinalCta() {
  const s = content.finalCta;
  return (
    <section className="px-4 pb-16 sm:px-6 lg:pb-24">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] bg-ink p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:p-14">
        <div>
          <h2 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-paper sm:text-6xl">
            {s.title}
          </h2>
          <p className="mt-4 text-lg text-paper/80">{s.text}</p>
        </div>
        <WaitlistForm location="footer" />
      </div>
    </section>
  );
}
