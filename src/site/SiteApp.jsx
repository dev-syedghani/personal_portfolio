import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { FiBriefcase, FiCpu, FiFileText, FiGithub, FiHome, FiLayers, FiLinkedin, FiMail, FiMoon, FiPlay, FiSun, FiTerminal } from "react-icons/fi";
import resumeData from "../utils/resumeData";
import Dock from "../components/reactbits/Dock";
import { FunLayer } from "../components/FunLayer";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { usePointerFine } from "../hooks/usePointerFine";
import { AchievementToasts, TrophyButton, unlock } from "./achievements";
import { Terminal, openTerminal } from "./Terminal";

// Loaded on demand: the archive is its own view, and the games sit near the
// bottom of the page. Both are warmed up once the page goes idle (below).
const loadArchive = () => import("./sections/ProjectsArchive");
const loadPlayground = () => import("./sections/Playground");
const ProjectsArchive = lazy(() => loadArchive().then((m) => ({ default: m.ProjectsArchive })));
const Playground = lazy(() => loadPlayground().then((m) => ({ default: m.Playground })));
import { Cursor } from "./Cursor";
import { Hero } from "./sections/Hero";
import { Marquee } from "./sections/Glance";
import { About } from "./sections/About";
import { Work } from "./sections/Work";
import { Expertise, Experience } from "./sections/Depth";
import { Toolbox } from "./sections/Toolbox";
import { ARCHIVE_HASH } from "./projects";
import { Activity } from "./sections/Activity";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";
import { scrollToEl, useSmoothScroll } from "./smoothScroll";
import "lenis/dist/lenis.css";
import "./site.css";

const SECTIONS = ["top", "about", "work", "expertise", "skills", "experience", "github", "games", "contact"];

/** Counts 0 → 100 over a black curtain, then lifts it. Skipped for reduced motion. */
function Preloader({ onDone }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const DURATION = 1300;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      setN(Math.round(100 * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 180);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      key="preloader"
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "var(--bg0)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "28px 24px" }}
    >
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", color: "var(--dim)", fontSize: 11.5, letterSpacing: "0.16em" }}>
        <span>{resumeData.name.toUpperCase()}</span>
        <span>PORTFOLIO · {new Date().getFullYear()}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <span className="mono" style={{ color: "var(--muted)", fontSize: 12.5 }}>Loading the good stuff…</span>
        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 400, fontSize: "clamp(64px,12vw,160px)", lineHeight: 0.8, letterSpacing: "-0.05em", color: "var(--ink)" }}>
          {n}
          <span style={{ color: "var(--accent)" }}>%</span>
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 2, width: `${n}%`, background: "var(--accent)" }} />
    </motion.div>
  );
}

/** Writes the pointer position into CSS vars for the grid-and-glow layer. */
function CursorGlow() {
  const ref = React.useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let idle;
    const move = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
        el.removeAttribute("data-idle");
      });
      clearTimeout(idle);
      idle = setTimeout(() => el.setAttribute("data-idle", ""), 2600);
    };
    const leave = () => el.setAttribute("data-idle", "");
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <div ref={ref} className="cursor-glow" data-idle="" aria-hidden="true" />;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ position: "fixed", top: 0, left: 0, right: 0, height: 1, zIndex: 70, transformOrigin: "0 50%", scaleX, background: "var(--accent-grad)" }}
    />
  );
}

function UkTime() {
  const fmt = () => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const THEME_KEY = "portfolio-theme";

function initialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  const html = document.documentElement;
  html.classList.toggle("dark", theme === "dark");
  html.classList.toggle("light", theme === "light");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#070a09" : "#f4f5f1");
}

/**
 * Theme state plus a toggle that, where the browser supports View Transitions,
 * reveals the new theme as a circle growing out of the button that was pressed.
 */
function useTheme(reduced) {
  const [theme, setTheme] = useState(initialTheme);
  const flips = React.useRef(0);

  // Five switches in one visit earns the "Light switch" achievement; the
  // terminal's theme command arrives as an event.
  useEffect(() => {
    if (++flips.current > 5) unlock("theme");
  }, [theme]);
  useEffect(() => {
    const on = (e) => setTheme(e.detail === "light" ? "light" : "dark");
    window.addEventListener("rm:theme", on);
    return () => window.removeEventListener("rm:theme", on);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = useCallback(
    (e) => {
      const next = theme === "dark" ? "light" : "dark";
      if (!document.startViewTransition || reduced) {
        setTheme(next);
        return;
      }
      const x = e?.clientX ?? window.innerWidth - 40;
      const y = e?.clientY ?? 40;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const vt = document.startViewTransition(() => {
        flushSync(() => setTheme(next));
        applyTheme(next);
      });
      vt.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      });
    },
    [theme, reduced]
  );

  return [theme, toggle];
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle cursor-target"
      data-cursor-label={theme === "dark" ? "lights on" : "lights off"}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      onClick={onToggle}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "grid" }}
        >
          {theme === "dark" ? <FiSun size={15} /> : <FiMoon size={15} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/**
 * "Hire me" plays hard to get on a mouse: it hops away twice, then gives in.
 * Touch and keyboard users get a normal link. Once caught it stays put for the
 * rest of the visit.
 */
const HOPS = [
  { x: -70, y: 52 },
  { x: -240, y: 52 },
];
function HirePill() {
  const fine = usePointerFine();
  const [hops, setHops] = useState(() => {
    try {
      return sessionStorage.getItem("rm-hire-caught") ? 99 : 0;
    } catch {
      return 99;
    }
  });
  const [label, setLabel] = useState("Hire me");
  const at = hops > 0 && hops <= HOPS.length ? HOPS[hops - 1] : { x: 0, y: 0 };

  const dodge = () => {
    if (!fine || hops > HOPS.length) return;
    const n = hops + 1;
    setHops(n);
    if (n <= HOPS.length) {
      setLabel(n === 1 ? "Nope!" : "Too slow!");
      return;
    }
    setLabel("Okay okay, let's talk");
    unlock("hire");
    try {
      sessionStorage.setItem("rm-hire-caught", "1");
    } catch {}
    setTimeout(() => setLabel("Hire me"), 2600);
  };

  return (
    <motion.a
      href="#contact"
      className="pill hire-pill cursor-target"
      data-cursor-label="say hi"
      onPointerEnter={dodge}
      animate={{ x: at.x, y: at.y }}
      transition={{ type: "spring", stiffness: 520, damping: 22 }}
    >
      {label}
    </motion.a>
  );
}

// Dock navigation has to leave the archive first: its target sections only
// exist on the main page, so scrollIntoView would silently do nothing. Clearing
// the hash swaps the view back, then the scroll runs once that has painted.
const go = (id) => () => {
  const scroll = () => scrollToEl(document.getElementById(id));
  if (window.location.hash === ARCHIVE_HASH) {
    history.pushState(null, "", window.location.pathname + window.location.search);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    requestAnimationFrame(() => requestAnimationFrame(scroll));
    return;
  }
  scroll();
};


/**
 * Marks each page band `is-offscreen` while it's out of view, and site.css
 * pauses every CSS animation inside a marked band. Without this, pings, border
 * lights and shines keep repainting all the way down a page nobody's looking at.
 */
function usePauseOffscreen(deps) {
  useEffect(() => {
    const bands = document.querySelectorAll(".site .sec, .site .hero, .site footer");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("is-offscreen", !e.isIntersecting)),
      { rootMargin: "150px 0px" }
    );
    bands.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Samples real frame times for a few seconds after the preloader; if the
 * machine can't hold ~45fps, html gets `lite`, which drops purely decorative
 * effects (see site.css). Remembered per browser so later visits start lite.
 */
function useLiteMode(loading) {
  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem("lite-mode");
    } catch {}
    if (stored === "1") document.documentElement.classList.add("lite");
    if (loading || stored !== null) return;

    let raf;
    let frames = 0;
    let slow = 0;
    let last = 0;
    const start = performance.now();
    const tick = (now) => {
      if (last) {
        frames += 1;
        if (now - last > 22) slow += 1;
      }
      last = now;
      if (now - start < 3500) {
        raf = requestAnimationFrame(tick);
        return;
      }
      // Hidden tabs throttle rAF; that says nothing about the machine.
      if (document.hidden || frames < 30) return;
      const lite = slow / frames > 0.3;
      document.documentElement.classList.toggle("lite", lite);
      try {
        localStorage.setItem("lite-mode", lite ? "1" : "0");
      } catch {}
    };
    const t = setTimeout(() => (raf = requestAnimationFrame(tick)), 1200);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [loading]);
}

/** True while the URL points at the project archive. Hash-based so the archive
 *  is a linkable, refresh-safe URL on GitHub Pages without a server rewrite. */
function useIsArchive() {
  const read = () => typeof window !== "undefined" && window.location.hash === ARCHIVE_HASH;
  const [isArchive, setIsArchive] = useState(read);
  useEffect(() => {
    const onHash = () => setIsArchive(read());
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return isArchive;
}

export default function SiteApp() {
  const reduced = usePrefersReducedMotion();
  const isArchive = useIsArchive();
  const [loading, setLoading] = useState(!reduced);
  const active = useScrollSpy(SECTIONS, { offset: 200, syncHash: false });

  const [theme, toggleTheme] = useTheme(reduced);
  useSmoothScroll({ enabled: !reduced, paused: loading, archiveHash: ARCHIVE_HASH });
  usePauseOffscreen([isArchive, loading]);
  useLiteMode(loading);

  // Prefetch the lazy chunks once the intro is done and the main thread idles.
  useEffect(() => {
    if (loading) return;
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1500));
    const id = idle(() => {
      loadArchive();
      loadPlayground();
      import("./sections/ToolboxOrbit");
    });
    return () => (window.cancelIdleCallback ?? clearTimeout)(id);
  }, [loading]);

  // "The whole story": reaching the footer.
  // Only after the preloader, and only from a real scroll (not a restored
  // position or a layout that's still settling).
  useEffect(() => {
    if (loading) return;
    const el = document.querySelector(".site footer");
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && window.scrollY > window.innerHeight * 3 && unlock("bottom"),
      { threshold: 0.6 }
    );
    const t = setTimeout(() => io.observe(el), 1500);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [loading]);

  // Keep the page from scrolling under the curtain.
  useEffect(() => {
    document.documentElement.style.overflow = loading ? "hidden" : "";
  }, [loading]);

  // A view swap isn't a scroll, so the archive would otherwise open at whatever
  // offset the Work section left behind.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [isArchive]);

  const dockItems = [
    { icon: <FiHome size={20} />, label: "Home", onClick: go("top"), active: active === "top" },
    { icon: <FiLayers size={20} />, label: "Work", onClick: go("work"), active: active === "work" },
    { icon: <FiCpu size={20} />, label: "Expertise", onClick: go("expertise"), active: active === "expertise" || active === "skills" },
    { icon: <FiBriefcase size={20} />, label: "Experience", onClick: go("experience"), active: active === "experience" },
    { icon: <FiGithub size={20} />, label: "Activity", onClick: go("github"), active: active === "github" },
    { icon: <FiPlay size={20} />, label: "Games", onClick: go("games"), active: active === "games" },
    { icon: <FiMail size={20} />, label: "Contact", onClick: go("contact"), active: active === "contact" },
    { separator: true },
    { icon: <FiLinkedin size={20} />, label: "LinkedIn", onClick: () => window.open(resumeData.linkedinUrl, "_blank", "noopener") },
    { icon: <FiFileText size={20} />, label: "Résumé", onClick: () => window.open(resumeData.resumeDownloads[0].file, "_blank", "noopener") },
  ];

  return (
    <FunLayer>
      <div className="site">
        <AnimatePresence>{loading && <Preloader onDone={() => setLoading(false)} />}</AnimatePresence>
        <ScrollProgress />
        <div className="site-grain" aria-hidden="true" />
        {!reduced && <CursorGlow />}
        <Cursor />

        <header className="topbar">
          <a href="#top" className="logo cursor-target" data-cursor-label="home" aria-label="Back to top"><b>SG</b> <span className="logo-name">{resumeData.name}</span></a>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <TrophyButton />
            <button type="button" className="theme-toggle term-btn cursor-target" data-cursor-label="terminal" aria-label="Open terminal" onClick={openTerminal}>
              <FiTerminal size={15} />
            </button>
            <span className="pill pill-time"><span className="live-dot" /> PKT <UkTime /></span>
            <HirePill />
          </div>
        </header>

        {isArchive ? (
          <Suspense fallback={<main className="sec archive" style={{ minHeight: "100vh" }} />}>
            <ProjectsArchive />
          </Suspense>
        ) : (
          <main>
            <Hero ready={!loading} />
            <Marquee />
            <About />
            <Work />
            <Expertise />
            <Toolbox />
            <Experience />
            <Activity />
            {/* Placeholder keeps the #games anchor and the page height stable. */}
            <Suspense fallback={<section className="sec" id="games" style={{ minHeight: 720 }} />}>
              <Playground />
            </Suspense>
            <Contact />
          </main>
        )}
        <Footer />

        <Terminal />
        <AchievementToasts />

        {/* React Bits "Gradual Blur": content softens into the bottom edge
            instead of being sliced off under the dock. */}
        <div className="edge-blur" aria-hidden="true">
          <i /><i />
        </div>

        <div className="dock-host">
          {/* accentColor reads the palette variable rather than a per-theme hex, so
              the dock's highlight follows a theme switch with everything else. */}
          <Dock items={dockItems} baseItemSize={46} magnification={68} panelHeight={64} theme={theme} accentColor="var(--accent)" />
        </div>
      </div>
    </FunLayer>
  );
}
