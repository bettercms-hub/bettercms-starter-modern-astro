import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { DeliveryForm } from "@bettercms-ai/sdk";

/**
 * Read the build snapshot (`bcms-content.json`): entries grouped into `collections` by model slug
 * (depth-1 hydrated), plus `forms` and the `projectId` (for search). Absent file → empty defaults
 * (e.g. before `npm run fetch-content` locally), so the site builds without crashing.
 */
export type Entry<T> = { slug: string; data: T };

type Snapshot = {
  projectId?: string | null;
  collections?: Record<string, Entry<unknown>[]>;
  forms?: DeliveryForm[];
  turnstileSiteKey?: string | null;
};

let cache: Snapshot | null = null;

function snapshot(): Snapshot {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(resolve(process.cwd(), "bcms-content.json"), "utf8")) as Snapshot;
  } catch {
    cache = {};
  }
  return cache;
}

export function listEntries<T>(model: string): Entry<T>[] {
  return (snapshot().collections?.[model] ?? []) as Entry<T>[];
}

export function getEntry<T>(model: string, slug: string): Entry<T> | undefined {
  return listEntries<T>(model).find((e) => e.slug === slug);
}

/** Singleton models (site/home/about/contact) have exactly one entry. */
export function getSingleton<T>(model: string): T | undefined {
  return listEntries<T>(model)[0]?.data;
}

export function getForms(): { forms: DeliveryForm[]; turnstileSiteKey: string | null } {
  const s = snapshot();
  return { forms: s.forms ?? [], turnstileSiteKey: s.turnstileSiteKey ?? null };
}

export function getForm(name: string): DeliveryForm | undefined {
  return getForms().forms.find((f) => f.name.toLowerCase() === name.toLowerCase());
}

export function getProjectId(): string | null {
  return snapshot().projectId ?? process.env.BCMS_PROJECT_ID ?? null;
}

/**
 * Map every searchable entry slug → its real route. The public search endpoint returns `/<slug>`
 * for every hit (page-model assumption); this template routes entries under /blog and /case-studies,
 * so the search UI rewrites hit URLs through this map and drops anything unmapped (e.g. the `site`
 * singleton) to avoid dead links.
 */
export function searchPathMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const e of listEntries("blog-post")) map[e.slug] = `/blog/${e.slug}`;
  for (const e of listEntries("case-study")) map[e.slug] = `/case-studies/${e.slug}`;
  const singleton: Record<string, string> = { home: "/", about: "/about", contact: "/contact" };
  for (const [model, url] of Object.entries(singleton)) {
    const e = listEntries(model)[0];
    if (e) map[e.slug] = url;
  }
  return map;
}
