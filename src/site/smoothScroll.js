import { useEffect } from "react";
import Lenis from "lenis";

let lenis = null;

/** Freezes page scrolling (both Lenis and native) while an overlay is open. */
export function lockScroll(locked) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (lenis) locked ? lenis.stop() : lenis.start();
}

/** Smoothly scrolls to an element, through Lenis when it's running. */
export function scrollToEl(el) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.3 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Inertia scrolling (Lenis) for wheel and trackpad; touch keeps the native
 * feel. Paused while `paused` (the preloader curtain), off for reduced motion.
 * Same-page "#id" links are routed through it, but never the archive's
 * "#/…" hash route, which has to change the URL to swap views.
 */
export function useSmoothScroll({ enabled, paused, archiveHash }) {
  useEffect(() => {
    if (!enabled) return;
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    let raf = requestAnimationFrame(function loop(t) {
      lenis?.raf(t);
      raf = requestAnimationFrame(loop);
    });

    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const id = a.getAttribute("href").slice(1);
      if (!/^[\w-]+$/.test(id) || window.location.hash === archiveHash) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      scrollToEl(el);
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      lenis = null;
    };
  }, [enabled, archiveHash]);

  useEffect(() => {
    if (!lenis) return;
    if (paused) lenis.stop();
    else lenis.start();
  }, [paused, enabled]);
}
