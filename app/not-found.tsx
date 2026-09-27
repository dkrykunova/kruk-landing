import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <h1 className="text-4xl font-extrabold text-ink">Сторінку не знайдено</h1>
      <p className="text-ink-2">Схоже, Крук відлетів не туди.</p>
      <a href="/" className="inline-flex min-h-12 items-center rounded-full bg-orange px-6 font-semibold text-ink hover:bg-orange-hover">
        На головну
      </a>
    </main>
  );
}
