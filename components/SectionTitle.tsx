export function SectionTitle({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <h2
        className={`font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl ${light ? "text-paper" : "text-ink"}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg ${light ? "text-paper/80" : "text-ink-2"}`}>{subtitle}</p>
      )}
    </div>
  );
}
