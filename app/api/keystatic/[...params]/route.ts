import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../keystatic.config";

// У режимі github адмінці потрібні ключі GitHub App. Поки їх немає (локально — не потрібні),
// API відповідає 503, а сайт збирається й працює як звичайно.
const ready =
  process.env.NODE_ENV === "development" ||
  (!!process.env.KEYSTATIC_GITHUB_CLIENT_ID && !!process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && !!process.env.KEYSTATIC_SECRET);

const notReady = () =>
  new Response("Адмінку ще не підключено: потрібні ключі GitHub App (KEYSTATIC_GITHUB_*).", { status: 503 });

const handlers = ready ? makeRouteHandler({ config }) : { GET: notReady, POST: notReady };

export const GET = handlers.GET;
export const POST = handlers.POST;
