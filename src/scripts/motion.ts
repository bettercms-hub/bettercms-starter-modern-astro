import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let io: IntersectionObserver | null = null;

/** Wire motion for the current page. Re-runs after every Astro view transition. */
function setup() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("motion-ready");

  // Scroll reveals via IntersectionObserver (robust: reveals in-view on load, rest on scroll).
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io?.unobserve(e.target); }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  // In-view elements reveal immediately (no flash); below-fold reveal on scroll.
  document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
    else io!.observe(el);
  });

  // Hero intro timeline + parallax (GSAP).
  const hero = document.querySelector(".hero");
  if (hero) {
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(".hero .hero-eyebrow", { autoAlpha: 0, y: 12, duration: 0.5 })
      .from(".hero .reveal-words .word > span", { yPercent: 115, duration: 0.9, stagger: 0.06 }, "-=0.2")
      .from(".hero .hero-lead", { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.5")
      .from(".hero .hero-cta > *", { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.1 }, "-=0.4")
      .from(".hero .hero-figure", { autoAlpha: 0, y: 48, scale: 0.98, duration: 1 }, "-=0.5");

    const figImg = document.querySelector(".hero-figure img");
    if (figImg) {
      gsap.to(figImg, { yPercent: 12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    }
  }

  // Magnetic buttons.
  document.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });
}

function teardown() {
  io?.disconnect();
  io = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
  document.documentElement.classList.remove("motion-ready");
}

document.addEventListener("astro:page-load", setup);
document.addEventListener("astro:before-swap", teardown);
