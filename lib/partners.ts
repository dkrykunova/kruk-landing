// Партнери Крука з content/partners під час збірки (сторінки статичні).
import "server-only";

import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

export type Partner = NonNullable<Awaited<ReturnType<typeof reader.collections.partners.read>>> & { slug: string };

export async function listPartners(): Promise<Partner[]> {
  const all = await reader.collections.partners.all();
  return all
    .filter(({ entry }) => entry.active)
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));
}

export async function getPartner(slug: string): Promise<Partner | null> {
  return (await listPartners()).find((p) => p.slug === slug) ?? null;
}

// Реферальне посилання з мітками джерела; параметр партнера (?via=…) зберігається.
export function partnerHref(p: Pick<Partner, "refUrl" | "slug">, from: string): string {
  const u = new URL(p.refUrl ?? "");
  u.searchParams.set("utm_source", "kruk");
  u.searchParams.set("utm_medium", "referral");
  u.searchParams.set("utm_campaign", "partners");
  u.searchParams.set("utm_content", from);
  return u.toString();
}
