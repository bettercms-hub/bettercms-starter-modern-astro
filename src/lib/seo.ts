import { resolveSeo, type ResolvedSeo } from "@bettercms-ai/sdk";
import { getSingleton } from "./content";
import { plain, type Author, type BlogPost, type CaseStudy, type Site } from "./cms";

type Json = Record<string, unknown>;
type SeoArgs = { title: string; metaTitle?: string; metaDescription?: string; schema?: Json | Json[] };

const site = (): Site | undefined => getSingleton<Site>("site");

function defaults() {
  const s = site();
  return {
    metaTitle: s?.seoTitle,
    metaDescription: s?.seoDescription,
    ogImage: s?.ogImage?.url ?? null,
    twitterHandle: s?.twitterHandle ?? null,
    siteSchema: s ? organizationSchema(s) : undefined,
  };
}

/** Resolve a route's head metadata + JSON-LD via the SDK (page-over-site merge). Base.astro renders
 *  the returned tags + jsonLd array into <head>. */
export function seo(args: SeoArgs): ResolvedSeo {
  return resolveSeo(
    { title: args.title, metaTitle: args.metaTitle, metaDescription: args.metaDescription, metaJson: { schema: args.schema } },
    defaults(),
  );
}

// ── Schema builders (https://schema.org) ────────────────────────────────────────────────────────

export function organizationSchema(s: Site): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.brandName,
    description: s.seoDescription,
    ...(s.ogImage?.url ? { logo: s.ogImage.url } : {}),
  };
}

export function blogPostingSchema(post: BlogPost, author: Author | null): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: plain(post.title),
    description: plain(post.excerpt),
    ...(post.coverImage?.url ? { image: post.coverImage.url } : {}),
    ...(post.publishedDate ? { datePublished: post.publishedDate } : {}),
    ...(author ? { author: { "@type": "Person", name: author.name, jobTitle: author.role } } : {}),
  };
}

export function caseStudySchema(c: CaseStudy): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: plain(c.title),
    description: plain(c.summary),
    ...(c.coverImage?.url ? { image: c.coverImage.url } : {}),
    ...(c.publishedDate ? { datePublished: c.publishedDate } : {}),
    ...(c.client ? { about: c.client } : {}),
  };
}
