// Читання матеріалів «Знань» з content/articles під час збірки (сторінки статичні).
import "server-only";

import { createReader } from "@keystatic/core/reader";
import keystaticConfig, { TOPICS, TYPES } from "../keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

export type ArticleMeta = {
  slug: string;
  title: string;
  type: string;
  typeLabel: string;
  topics: string[];
  excerpt: string;
  date: string;
  author: string;
  cover: string | null;
  cta: string;
  minutes: number;
};

export const typeLabel = (v: string) => TYPES.find((t) => t.value === v)?.label ?? v;
export const topicLabel = (v: string) => TOPICS.find((t) => t.value === v)?.label ?? v;

function words(node: unknown): number {
  // Приблизна кількість слів у дереві Markdoc — для «хвилин читання».
  const text = JSON.stringify(node).replace(/"[a-z]+":/gi, " ");
  return text.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
}

export async function listArticles(): Promise<ArticleMeta[]> {
  const all = await reader.collections.articles.all();
  const out: ArticleMeta[] = [];
  for (const { slug, entry } of all) {
    if (entry.draft) continue;
    const { node } = await entry.body();
    out.push({
      slug,
      title: entry.title,
      type: entry.type,
      typeLabel: typeLabel(entry.type),
      topics: [...entry.topics],
      excerpt: entry.excerpt,
      date: entry.date ?? "",
      author: entry.author,
      cover: entry.cover ?? null,
      cta: entry.cta,
      minutes: Math.max(1, Math.round(words(node) / 180)),
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticle(slug: string) {
  const entry = await reader.collections.articles.read(slug);
  if (!entry || entry.draft) return null;
  const { node } = await entry.body();
  return { entry, node };
}
