/**
 * Live-preview binding: spread `bcmsField(path, kind)` onto an element rendering a CMS field so the
 * BetterCMS dashboard live preview can map it to an editable overlay. Mirrors @bettercms-ai/codegen
 * output — attributes are emitted on every build (two inert `data-*` attributes), so the site is
 * editable no matter which pipeline built it.
 *
 *   <h1 {...bcmsField("home.heroTitle", "text")}>{home.heroTitle}</h1>
 */
export type FieldKind = "text" | "richtext" | "image" | "array" | "reference";

export function bcmsField(path: string, kind: FieldKind = "text"): Record<string, string> {
  return { "data-bcms-field": path, "data-bcms-kind": kind };
}
