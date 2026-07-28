# BetterCMS — Modern Aesthetic Starter (Astro)

A premium, animated studio site rendered from a BetterCMS project. Content (Home, About, Contact,
Blog, Case Studies, site settings) lives in BetterCMS content models; this repo owns the design,
routing, and motion. Pair it with the **Modern Aesthetic** template when you create a project, or
point it at any BetterCMS project with the same model slugs.

## What it demonstrates

- **Bespoke, content-model-driven pages** — Home/About/Contact are structured singletons, Blog and
  Case Studies are collections. Every section is editable in the BetterCMS entry form.
- **Animation** — GSAP + ScrollTrigger (hero word-reveal, parallax, staggered scroll reveals,
  magnetic CTAs, logo marquee) + Astro View Transitions. Respects `prefers-reduced-motion`.
- **Site search** — a ⌘K modal over the public delivery search API.
- **Forms** — Contact + newsletter post to `/api/v1/forms/public/:id/submissions` (honeypot,
  per-field validation).
- **SEO + schema markup** — per-page `<title>`/OG/Twitter via `resolveSeo()`, plus JSON-LD
  (Organization, WebSite, BlogPosting, Article).
- **Custom code** — the `site` model's `customHeadHtml` / `customBodyEndHtml` are injected into
  `<head>` and end-of-`<body>`.
- **Live preview** — editable fields carry `data-bcms-field` attributes on every build.

## Known limitation — this starter does not render BetterCMS *pages*

This is a **hand-authored showcase**, not a block-driven site. Every section (`Hero.astro`,
`Stats.astro`, `Features.astro`, `Testimonials.astro`, `Cta.astro`, the contact and newsletter
forms) is a bespoke component reading typed fields off the `home` / `about` / `contact`
singletons. Accordingly `scripts/fetch-content.mjs` fetches **entries and forms only — never
`pages`**, and nothing here mounts `<BcmsBlocks>`. Its only BetterCMS dependencies are
`@bettercms-ai/sdk` and `@bettercms-ai/types`; the `@bettercms-ai/astro` adapter is not installed.

**What that means:** anything you place on a *page* in the Visual Editor — a form block, a
section, a slider — renders **nothing** on this site. Those pages have no route here at all.
Edit the content-model entries instead; the BetterCMS entry form is the editing surface for this
design, and live preview still maps to it through `data-bcms-field`.

**If you want the Visual Editor's block canvas to drive the site**, use `bettercms-starter-astro`
(or `bettercms-starter` for Next) — both mount `<BcmsBlocks>` and render whatever the builder
produces. Don't try to mix the two on one page: a page is either block-driven or field-driven,
and adding fields to a block page breaks its canvas binding.

## Local development

```bash
cp .env.example .env   # set PUBLIC_BCMS_WORKSPACE + BCMS_API_KEY
npm install
npm run fetch-content  # writes bcms-content.json from the delivery API
npm run dev
```

`npm run build` produces a fully static `dist/`. On BetterCMS hosting the deploy Action runs
`fetch-content` (injecting the API key + project id) before `astro build`.

## Content model slugs

`site` · `home` · `about` · `contact` · `blog-post` · `case-study` · `author`.
