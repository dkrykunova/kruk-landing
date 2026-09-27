// Точка входу Cloudflare Worker: сайт (OpenNext) + регулярні задачі (Cron Triggers).
// @ts-ignore — файл з'являється після `opennextjs-cloudflare build`
import { default as handler } from "./.open-next/worker.js";

type Env = { CRON_SECRET?: string; NEXT_PUBLIC_SITE_URL?: string };

export default {
  fetch: handler.fetch,

  // Cron викликає наш же API-роут через fetch воркера — логіка лишається в Next.js.
  async scheduled(_event: unknown, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    const req = new Request(`${env.NEXT_PUBLIC_SITE_URL ?? "https://kruk.marketing"}/api/cron/retry-sync`, {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    ctx.waitUntil(
      handler.fetch(req, env, ctx).then(async (r: Response) => console.log("cron retry-sync", r.status, await r.text())),
    );
  },
};
