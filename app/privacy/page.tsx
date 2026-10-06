import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { company } from "@/content/uk";

export const metadata: Metadata = {
  title: "Політика конфіденційності — Крук",
  description: "Які дані збирає Крук, навіщо, кому передає й як довго зберігає. Ваші права й налаштування cookies.",
  alternates: { canonical: "/privacy" },
};

// ЧЕРНЕТКА-ЗАГЛУШКА. Остаточний текст надає юрист замовника.
export default function Privacy() {
  return (
    <LegalPage title="Політика конфіденційності">
      <p className="rounded-xl bg-lilac-soft p-4 text-sm">
        Чернетка. Остаточний текст буде погоджено з юристом до публікації.
      </p>
      <h2>Хто обробляє дані</h2>
      <p>
        {company.legalName}, код ЄДРПОУ {company.edrpou}
        {company.address && `, ${company.address}`}. Email для запитів щодо персональних даних:{" "}
        <a className="underline" href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
      <h2>Які дані ми збираємо</h2>
      <ul>
        <li>підписка: email або Telegram ID, username та ім'я з профілю Telegram;</li>
        <li>заявка партнера: назва компанії, сайт, опис послуги, ім'я, посада, email, Telegram або телефон;</li>
        <li>джерело переходу (UTM-мітки) та дату й час згоди.</li>
      </ul>
      <h2>Навіщо</h2>
      <p>Щоб надсилати вам матеріали про маркетинг і продажі, новини та пропозиції Крука, Crowbert і партнерів; щоб розглянути заявку партнера й зв'язатися з вами.</p>
      <h2>Кому передаються дані</h2>
      <p>
        Постачальникам, які допомагають нам працювати: Google (Sheets, Analytics), Brevo, Telegram, Meta,
        Cloudflare, Upstash, хостинг-провайдер.
      </p>
      <h2>Як довго зберігаються</h2>
      <p>12 місяців або до відкликання згоди.</p>
      <h2>Ваші права</h2>
      <p>
        Ви можете отримати доступ до своїх даних, виправити чи видалити їх, відкликати згоду або подати скаргу
        Уповноваженому Верховної Ради України з прав людини.
      </p>
      <h2>Cookies</h2>
      <p>
        Ми використовуємо необхідні cookies, а аналітичні й маркетингові — лише за вашою згодою. Змінити вибір можна
        за посиланням «Налаштування cookies» унизу сторінки.
      </p>
    </LegalPage>
  );
}
