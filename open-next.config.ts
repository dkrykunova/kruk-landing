import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Сторінки «Знань» збираються наперед (на Cloudflare немає доступу до файлів content/),
// тож готовий HTML віддаємо зі статичних файлів збірки.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
