import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { company } from "@/content/uk";

export const metadata: Metadata = { title: "Згода на обробку персональних даних — Крук" };

// ЧЕРНЕТКА-ЗАГЛУШКА. Остаточний текст надає юрист замовника.
export default function Consent() {
  return (
    <LegalPage title="Згода на обробку персональних даних">
      <p className="rounded-xl bg-lilac-soft p-4 text-sm">
        Чернетка. Остаточний текст буде погоджено з юристом до публікації. Редакція від 1 жовтня 2026.
      </p>
      <p>
        Записуючись до листа очікування, я надаю {company.legalName} (код ЄДРПОУ {company.edrpou}) згоду на
        обробку моїх персональних даних — email або даних профілю Telegram — з метою інформування про запуск
        сервісу «Крук» та надсилання новин і пропозицій.
      </p>
      <p>
        Я можу відкликати згоду будь-коли: за посиланням «Відписатися» в листі, командою /stop у Telegram-боті
        або листом на <a className="underline" href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
    </LegalPage>
  );
}
