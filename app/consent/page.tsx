import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { company } from "@/content/uk";

export const metadata: Metadata = {
  title: "Згода на обробку персональних даних — Крук",
  description: "Текст згоди на обробку персональних даних під час підписки на матеріали Крука чи заявки партнера.",
  alternates: { canonical: "/consent" },
};

// ЧЕРНЕТКА-ЗАГЛУШКА. Остаточний текст надає юрист замовника.
export default function Consent() {
  return (
    <LegalPage title="Згода на обробку персональних даних">
      <p className="rounded-xl bg-lilac-soft p-4 text-sm">
        Чернетка. Остаточний текст буде погоджено з юристом до публікації. Редакція від 2 жовтня 2026.
      </p>
      <p>
        Підписуючись на матеріали або надсилаючи заявку партнера, я надаю {company.legalName} (код ЄДРПОУ{" "}
        {company.edrpou}) згоду на обробку моїх персональних даних — email, даних профілю Telegram або даних із
        заявки — з метою надсилання матеріалів, новин і пропозицій Крука, Crowbert і партнерів та розгляду заявки.
      </p>
      <p>
        Я можу відкликати згоду будь-коли: за посиланням «Відписатися» в листі, командою /stop у Telegram-боті
        або листом на <a className="underline" href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
    </LegalPage>
  );
}
