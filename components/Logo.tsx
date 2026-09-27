// Тимчасовий текстовий логотип.
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`text-2xl font-extrabold tracking-tight ${light ? "text-paper" : "text-ink"}`}>
      крук<span className="text-orange">.</span>
    </span>
  );
}
