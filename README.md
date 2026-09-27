# Крук — лендінг листа очікування

Next.js + Tailwind. ТЗ: документ «ТЗ: лендінг листа очікування Крук».

## Запуск локально

```bash
npm install
cp .env.example .env.local   # за потреби заповнити значення
npm run dev                  # http://localhost:3000
```

## Де що лежить

| Шлях | Що це |
| --- | --- |
| `content/uk.ts` | Усі тексти лендінгу — редагувати тут |
| `app/page.tsx` | Порядок блоків сторінки |
| `components/` | Блоки сторінки, форма, таймер |
| `app/api/waitlist/route.ts` | API запису в лист очікування |
| `lib/store.ts` | Сховище (етап 1 — у пам'яті; етап 2 — Redis + Sheets + Brevo) |
| `app/privacy`, `app/consent` | Юридичні сторінки (чернетки) |

## Етапи

1. ✅ Верстка й форма з тестовим сховищем
2. Інтеграції: Google Sheets, Brevo, Telegram-бот, Redis, Turnstile
3. Аналітика: GA4, Meta Pixel + CAPI, банер cookies
4. Публікація на Vercel, домен kruk.marketing

## Видалення даних за запитом

Видалити рядок у Google Sheets, контакт у Brevo та ключі `waitlist:email:<sha256>` / `tg:<id>` у Redis.
