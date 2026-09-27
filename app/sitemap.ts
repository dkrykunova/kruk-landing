import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy", "/consent"].map((p) => ({ url: `${config.siteUrl}${p}` }));
}
