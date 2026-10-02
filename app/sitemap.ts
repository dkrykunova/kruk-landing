import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/articles";
import { config } from "@/lib/config";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/znannya", "/crowbert", "/partnery", "/partnery/staty-partnerom", "/pro-kruk", "/privacy", "/consent"].map((p) => ({ url: `${config.siteUrl}${p}` }));
  const articles = (await listArticles()).map((a) => ({ url: `${config.siteUrl}/znannya/${a.slug}`, lastModified: a.date }));
  return [...pages, ...articles];
}
