/**
 * Build snapshot: write `bcms-content.json` (entries grouped into `collections` by model slug, plus
 * forms + projectId) — the shape the BetterCMS deploy Action generates on every publish. A static
 * Astro build reads everything from this file, so run it before `npm run dev` / `npm run build`.
 *
 *   PUBLIC_BCMS_API_URL=… PUBLIC_BCMS_WORKSPACE=… BCMS_API_KEY=… node scripts/fetch-content.mjs
 */
import { writeFile } from "node:fs/promises";

const apiUrl = process.env.PUBLIC_BCMS_API_URL ?? "https://api.bettercms.ai";
const workspace = process.env.PUBLIC_BCMS_WORKSPACE;
const apiKey = process.env.BCMS_API_KEY;
if (!workspace || !apiKey) {
  console.error("Set PUBLIC_BCMS_WORKSPACE and BCMS_API_KEY (see .env.example).");
  process.exit(1);
}

const get = async (path) => {
  const res = await fetch(`${apiUrl}/api/v1/delivery/${workspace}/${path}`, { headers: { "X-API-Key": apiKey } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return (await res.json())?.data ?? null;
};

const [entries, forms] = await Promise.all([
  get("content-entries?perPage=200&depth=1"),
  get("forms"),
]);

const collections = {};
for (const e of entries?.items ?? []) {
  const model = e?._meta?.modelSlug ?? "unknown";
  (collections[model] ??= []).push(e);
}

const projectId = process.env.BCMS_PROJECT_ID ?? entries?.projectId ?? null;

const snapshot = {
  $schema: "bcms-content/v1",
  workspace,
  projectId,
  collections,
  forms: forms?.items ?? [],
  turnstileSiteKey: forms?.turnstileSiteKey ?? null,
};
await writeFile("bcms-content.json", JSON.stringify(snapshot, null, 2));
const counts = Object.entries(collections).map(([m, v]) => `${v.length} ${m}`).join(", ");
console.log(`Wrote bcms-content.json: ${snapshot.forms.length} form(s), project ${projectId ?? "—"}, entries [${counts}].`);
