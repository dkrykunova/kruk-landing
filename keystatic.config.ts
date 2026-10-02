// Адмінка Keystatic: матеріали «Знань» і партнери. Контент — файли в content/, кожна правка — коміт у GitHub.
// Локально (npm run dev) — режим local: зберігає файли на диск. На сайті — режим github.
import { collection, config, fields } from "@keystatic/core";

const isDev = process.env.NODE_ENV === "development";

export const TYPES = [
  { label: "Порада", value: "porada" },
  { label: "Кейс", value: "keis" },
  { label: "Новина", value: "novyna" },
] as const;

export const TOPICS = [
  { label: "Соцмережі", value: "socmerezhi" },
  { label: "Лідогенерація", value: "leadgen" },
  { label: "Продажі", value: "sales" },
  { label: "Підтримка клієнтів", value: "support" },
  { label: "Утримання клієнтів", value: "retention" },
] as const;

export default config({
  storage: isDev ? { kind: "local" } : { kind: "github", repo: "dkrykunova/kruk-landing" },
  ui: { brand: { name: "Крук" } },
  collections: {
    articles: collection({
      label: "Матеріали «Знань»",
      slugField: "title",
      path: "content/articles/*",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: {
        title: fields.slug({ name: { label: "Заголовок" }, slug: { label: "Адреса (латиницею)" } }),
        type: fields.select({ label: "Тип", options: [...TYPES], defaultValue: "porada" }),
        topics: fields.multiselect({ label: "Теми", options: [...TOPICS] }),
        excerpt: fields.text({ label: "Опис для картки й Google (1–2 речення)", multiline: true, validation: { length: { min: 20, max: 220 } } }),
        date: fields.date({ label: "Дата публікації", validation: { isRequired: true } }),
        author: fields.text({ label: "Автор", defaultValue: "Дарія" }),
        cover: fields.image({ label: "Обкладинка (необов'язково)", directory: "public/images/articles", publicPath: "/images/articles/" }),
        cta: fields.select({
          label: "Блок дії після тексту",
          options: [
            { label: "AI-агент Crowbert", value: "crowbert" },
            { label: "Підписка на матеріали", value: "subscribe" },
            { label: "Партнери: лідогенерація", value: "leadgen" },
            { label: "Партнери: підтримка", value: "support" },
            { label: "Партнери: продажі", value: "sales" },
            { label: "Партнери: утримання", value: "retention" },
          ],
          defaultValue: "subscribe",
        }),
        draft: fields.checkbox({ label: "Чернетка (не показувати на сайті)", defaultValue: false }),
        body: fields.markdoc({ label: "Текст" }),
      },
    }),
    partners: collection({
      label: "Партнери",
      slugField: "name",
      path: "content/partners/*",
      format: { data: "json" },
      schema: {
        name: fields.slug({ name: { label: "Назва" }, slug: { label: "Адреса сторінки", description: "kruk.marketing/partnery/…" } }),
        category: fields.select({
          label: "Категорія",
          options: [...TOPICS.filter((t) => t.value !== "socmerezhi")],
          defaultValue: "leadgen",
        }),
        tagline: fields.text({ label: "Що це, одним рядком", validation: { length: { min: 10, max: 120 } } }),
        summary: fields.text({ label: "Опис для картки й Google (1–2 речення)", multiline: true, validation: { length: { min: 20, max: 240 } } }),
        logo: fields.image({ label: "Логотип (необов'язково)", directory: "public/images/partners", publicPath: "/images/partners/" }),
        about: fields.text({ label: "Про сервіс — 1–2 абзаци", multiline: true }),
        forWhom: fields.array(fields.text({ label: "Пункт" }), { label: "Кому підійде", itemLabel: (p) => p.value }),
        notFor: fields.array(fields.text({ label: "Пункт" }), { label: "Кому поки зарано", itemLabel: (p) => p.value }),
        benefits: fields.array(
          fields.object({ title: fields.text({ label: "Заголовок" }), text: fields.text({ label: "Текст", multiline: true }) }),
          { label: "Як допомагає малому бізнесу", itemLabel: (p) => p.fields.title.value },
        ),
        steps: fields.array(fields.text({ label: "Крок" }), { label: "Як почати", itemLabel: (p) => p.value }),
        pricing: fields.text({ label: "Ціни й пробний період", multiline: true }),
        good: fields.text({ label: "Варто знати (мова, ринок, обмеження)", multiline: true }),
        refUrl: fields.url({ label: "Реферальне посилання", validation: { isRequired: true } }),
        ctaLabel: fields.text({ label: "Текст кнопки", defaultValue: "Спробувати безкоштовно" }),
        checkedAt: fields.date({ label: "Інформацію перевірено" }),
        active: fields.checkbox({ label: "Показувати на сайті", defaultValue: false }),
      },
    }),
  },
});
