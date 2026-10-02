import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/crowbert", "/partnery/staty-partnerom", "/privacy", "/consent"].map((p) => ({ url: `${config.siteUrl}${p}` }));
}
