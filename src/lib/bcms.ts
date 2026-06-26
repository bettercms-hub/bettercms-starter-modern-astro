/**
 * Live-preview binding: spread `bcmsField(path, kind)` onto an element rendering a CMS field so the
 * BetterCMS dashboard live preview can map it to an editable overlay. Mirrors @betttercms/codegen
 * output — attributes are emitted ONLY when `BCMS_ANNOTATE=1` (preview builds), so production builds
 * carry zero overhead. Falls back to the platform's content-match binding when absent.
 *
 *   <h1 {...bcmsField("home.heroTitle", "text")}>{home.heroTitle}</h1>
 */
const ANNOTATE = ((): boolean => {
  const v = process.env.BCMS_ANNOTATE;
  return v != null && v !== "" && v !== "0" && v !== "false";
})();

export type FieldKind = "text" | "richtext" | "image" | "array" | "reference";

export function bcmsField(path: string, kind: FieldKind = "text"): Record<string, string> {
  return ANNOTATE ? { "data-bcms-field": path, "data-bcms-kind": kind } : {};
}
