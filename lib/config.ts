// Публічна конфігурація (NEXT_PUBLIC_* доступні і в браузері).
export const config = {
  launchAt: process.env.NEXT_PUBLIC_LAUNCH_AT ?? "2026-10-19T10:00:00+03:00",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kruk.marketing",
  tgBotUsername: process.env.NEXT_PUBLIC_TG_BOT_USERNAME ?? "",
  tgChannelUrl: process.env.NEXT_PUBLIC_TG_CHANNEL_URL ?? "",
  platformSignupUrl: process.env.NEXT_PUBLIC_PLATFORM_SIGNUP_URL ?? "",
};

export const launchTime = () => new Date(config.launchAt).getTime();
export const isLaunched = (now = Date.now()) => now >= launchTime();
