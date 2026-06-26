/** Nav (scroll state + mobile menu) and ⌘K search over the public delivery search endpoint.
 *  Window-level listeners attach once; element bindings refresh on every Astro view transition. */
type Hit = { title: string; slug: string; type: "page" | "entry"; snippet: string; url: string };
type Config = { project: string | null; apiUrl: string; pathMap: Record<string, string> };

const cfg = (): Config => {
  const el = document.getElementById("bcms-search-config");
  try { return JSON.parse(el?.textContent || "{}"); } catch { return { project: null, apiUrl: "https://api.bettercms.ai", pathMap: {} }; }
};
const overlay = () => document.getElementById("search-overlay");
const empty = (msg: string) => `<p class="search-empty">${msg}</p>`;
const esc = (s: string) => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };

function openSearch() {
  const o = overlay();
  if (!o) return;
  o.hidden = false;
  setTimeout(() => document.getElementById("search-input")?.focus(), 0);
}
function closeSearch() {
  const o = overlay();
  if (!o) return;
  o.hidden = true;
  const input = document.getElementById("search-input") as HTMLInputElement | null;
  const results = document.getElementById("search-results");
  if (input) input.value = "";
  if (results) results.innerHTML = empty("Type at least two characters to search.");
}

// Window-level listeners — attach once.
window.addEventListener("scroll", () => {
  const nav = document.getElementById("site-nav");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
}, { passive: true });
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
  if (e.key === "Escape") closeSearch();
});

// Per-page bindings.
document.addEventListener("astro:page-load", () => {
  document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", openSearch));
  document.querySelectorAll("[data-search-close]").forEach((b) => b.addEventListener("click", closeSearch));
  const toggle = document.querySelector("[data-menu-toggle]");
  const links = document.getElementById("nav-links");
  toggle?.addEventListener("click", () => {
    const open = links?.classList.toggle("open");
    toggle.textContent = open ? "Close" : "Menu";
  });
  links?.addEventListener("click", () => links.classList.remove("open"));

  const o = overlay();
  const input = document.getElementById("search-input") as HTMLInputElement | null;
  const results = document.getElementById("search-results");
  if (!o || !input || !results || o.dataset.wired) return;
  o.dataset.wired = "1";
  o.addEventListener("click", (e) => { if (e.target === o) closeSearch(); });

  let t: ReturnType<typeof setTimeout>, ctrl: AbortController | null = null;
  input.addEventListener("input", () => {
    const c = cfg();
    const project = c.project;
    const q = input.value.trim();
    clearTimeout(t); ctrl?.abort();
    if (!project || q.length < 2) { results.innerHTML = empty("Type at least two characters to search."); return; }
    t = setTimeout(async () => {
      ctrl = new AbortController();
      try {
        const res = await fetch(`${c.apiUrl}/api/v1/delivery/search?project=${encodeURIComponent(project)}&q=${encodeURIComponent(q)}&limit=8`, { signal: ctrl.signal });
        const data = (await res.json()) as { hits?: Hit[] };
        const hits = (data.hits ?? [])
          .map((h) => ({ ...h, href: c.pathMap[h.slug] ?? (h.type === "page" ? h.url : "") }))
          .filter((h) => h.href);
        results.innerHTML = hits.length
          ? hits.map((h) => `<a class="search-hit" href="${h.href}"><span class="search-kind">${h.type}</span><span class="t">${esc(h.title)}</span>${h.snippet ? `<span class="s">${h.snippet}</span>` : ""}</a>`).join("")
          : empty(`No results for “${esc(q)}”.`);
      } catch { /* aborted/offline */ }
    }, 200);
  });
});
