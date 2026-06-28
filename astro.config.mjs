import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Static site: BetterCMS hosting serves the build as files, and the deploy Action writes
// bcms-content.json BEFORE the build (no API key at build time). All content is read from that
// snapshot. Forms + search talk to the public delivery API directly from the browser.
export default defineConfig({
  output: "static",
  vite: { plugins: [tailwindcss()] },
});
