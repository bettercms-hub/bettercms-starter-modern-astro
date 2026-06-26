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
- **Live preview** — editable fields carry `data-bcms-field` attributes when built with
  `BCMS_ANNOTATE=1`.

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
