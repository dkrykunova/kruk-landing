// Точка входу Cloudflare Worker: сайт (OpenNext) + регулярні задачі (Cron Triggers).
// @ts-ignore — файл з'являється після `opennextjs-cloudflare build`
import { default as handler } from "./.open-next/worker.js";

type Env = { CRON_SECRET?: string; NEXT_PUBLIC_SITE_URL?: string };

export default {
  // www.kruk.marketing → kruk.marketing (301), решта — сайт Next.js.
  fetch(req: Request, env: Env, ctx: unknown) {
    const url = new URL(req.url);
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    return handler.fetch(req, env, ctx);
  },

  // Cron викликає наші ж API-роути через fetch воркера — логіка лишається в Next.js.
  //   "* * * * *"  → /api/cron/broadcast (прогрів у канал і бот)
  //   "15 * * * *" → /api/cron/retry-sync (повтор запису в Sheets і Brevo)
  async scheduled(event: { cron: string }, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    const path = event.cron === "15 * * * *" ? "/api/cron/retry-sync" : "/api/cron/broadcast";
    const req = new Request(`${env.NEXT_PUBLIC_SITE_URL ?? "https://kruk.marketing"}${path}`, {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    ctx.waitUntil(
      handler.fetch(req, env, ctx).then(async (r: Response) => {
        const body = await r.text();
        if (path !== "/api/cron/broadcast" || body.includes("report")) console.log("cron", path, r.status, body);
      }),
    );
  },
};
