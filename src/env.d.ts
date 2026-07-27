/// <reference types="astro/client" />

/**
 * Cloudflare Turnstile, loaded via api.js in Base.astro (only when a site key exists).
 * Optional because the script is absent on projects with no Turnstile configured —
 * scripts/forms.ts must therefore always call it as `window.turnstile?.reset()`.
 */
interface Window {
  turnstile?: { reset: (widget?: string | HTMLElement) => void };
}
