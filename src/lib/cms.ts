/**
 * Content shapes seeded by the "Modern Aesthetic" template, plus tiny accessors for the stored
 * field-value shapes: images are `{ url, alt }`, richtext is `{ html }`, repeatable arrays are
 * `{ repeatable: [...] }`, and references hydrate to `{ slug, data }` at delivery depth ≥ 1.
 */
export type Image = { url: string; alt?: string };
export type RichText = { html?: string };
export type Repeatable<T> = { repeatable?: T[] };
/** A depth≥1 hydrated reference: the nested entry in raw delivery shape. */
export type Hydrated<T> = { slug: string; data?: T };

// ── Item shapes (zoned-array repeatable sub-objects) ────────────────────────────────────────────
export type NavLink = { label: string; href: string };
export type Social = { label: string; href: string };
export type Stat = { value: string; label: string };
export type Feature = { icon?: string; title: string; body?: string };
export type Logo = { name?: string; image?: Image };
export type Testimonial = { quote: string; authorName?: string; authorRole?: string; avatar?: Image };
export type ValueItem = { title: string; body?: string };
export type Metric = { value: string; label: string };

// ── Entry data shapes ───────────────────────────────────────────────────────────────────────────
export type Site = {
  brandName: string;
  navLinks?: Repeatable<NavLink>;
  footerTagline?: RichText;
  socials?: Repeatable<Social>;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: Image;
  twitterHandle?: string;
  customHeadHtml?: string;
  customBodyEndHtml?: string;
};

export type Author = { name: string; role?: string; bio?: string; avatar?: Image };

export type Home = {
  // Inline rich-text (formattable in the Visual Editor) — seeded as `{ html, inline: true }`.
  eyebrow?: RichText;
  heroTitle: RichText;
  heroSubtitle?: RichText;
  heroImage?: Image;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  stats?: Repeatable<Stat>;
  featuresHeading?: RichText;
  features?: Repeatable<Feature>;
  logos?: Repeatable<Logo>;
  testimonials?: Repeatable<Testimonial>;
  ctaHeading?: RichText;
  ctaBody?: RichText;
  ctaButtonText?: string;
  ctaButtonHref?: string;
};

export type About = {
  eyebrow?: string;
  heroTitle: string;
  heroSubtitle?: string;
  heroImage?: Image;
  storyTitle?: string;
  story?: RichText;
  values?: Repeatable<ValueItem>;
  stats?: Repeatable<Stat>;
  team?: Hydrated<Author>[] | string[];
};

export type Contact = { eyebrow?: string; heroTitle: string; heroSubtitle?: string };

export type BlogPost = {
  title: string;
  excerpt?: string;
  coverImage?: Image;
  body?: RichText;
  author?: Hydrated<Author> | string;
  publishedDate?: string;
  tags?: string[];
};

export type CaseStudy = {
  title: string;
  client?: string;
  summary?: string;
  coverImage?: Image;
  body?: RichText;
  metrics?: Repeatable<Metric>;
  publishedDate?: string;
};

// ── Accessors ─────────────────────────────────────────────────────────────────────────────────
/** Unwrap a zoned-repeatable array field to a plain list. */
export const items = <T>(field?: Repeatable<T>): T[] => (Array.isArray(field?.repeatable) ? field.repeatable : []);

/** Plain text from an inline rich-text field — for SEO titles/meta and other attribute contexts. */
export const plain = (rt?: RichText | string): string =>
  typeof rt === "string" ? rt : (rt?.html ?? "").replace(/<[^>]+>/g, "").trim();

/** Resolve a single hydrated reference (bare id string at depth 0 → null). */
export const refData = <T>(ref?: Hydrated<T> | string): T | null =>
  ref && typeof ref === "object" ? (ref.data ?? null) : null;

/** Resolve a hydrated multi-reference list to the nested entries (drops un-hydrated ids). */
export const refList = <T>(refs?: Hydrated<T>[] | string[]): T[] =>
  Array.isArray(refs)
    ? refs.flatMap((r) => (r && typeof r === "object" && r.data ? [r.data] : []))
    : [];
