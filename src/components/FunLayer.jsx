import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCommand } from "react-icons/fi";
import ClickSpark from "./reactbits/ClickSpark";
import { useThemeMode } from "../hooks/useThemeMode";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { unlock } from "../site/achievements";

// Sparks are drawn on a canvas, so they need real colours rather than the
// var(--accent) tokens. These track the accent ramp in index.css per theme.
const SPARK_COLORS = {
  dark: ["#FF4258", "#FF8A3D", "#F7EEEC"],
  light: ["#CC1530", "#E8590C", "#1A1110"],
};

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/**
 * Site-wide playful layer: a small accent-coloured spark on every click, and a
 * Konami-code easter egg that sets off a burst across the screen. Kept out of
 * the way of reduced-motion users entirely.
 */
export function FunLayer({ children }) {
  const mode = useThemeMode();
  const reducedMotion = usePrefersReducedMotion();
  const sparkRef = useRef(null);
  const [toast, setToast] = useState(false);

  // A friendly hello for the people who open devtools on a portfolio.
  useEffect(() => {
    if (window.__rmGreeted) return;
    window.__rmGreeted = true;
    console.log(
      "%cHey, fellow dev!%c\nPoking around the source? Press ` on the page for a terminal, or try the Konami code: ↑ ↑ ↓ ↓ ← → ← → B A",
      "font: 700 14px 'Space Grotesk', sans-serif; color: #FF4258",
      "font: 12px 'Geist Mono', monospace; color: inherit"
    );
  }, []);

  useEffect(() => {
    let progress = 0;
    const onKey = (e) => {
      // Don't hijack typing in the contact form.
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress < KONAMI.length) return;
      progress = 0;
      celebrate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  function celebrate() {
    unlock("konami");
    setToast(true);
    window.clearTimeout(celebrate.t);
    celebrate.t = window.setTimeout(() => setToast(false), 4200);
    if (reducedMotion || !sparkRef.current) return;
    // The spark layer covers the whole page, so aim at the visible viewport.
    for (let i = 0; i < 14; i++) {
      window.setTimeout(() => {
        const x = window.innerWidth * (0.1 + Math.random() * 0.8);
        const y = window.scrollY + window.innerHeight * (0.15 + Math.random() * 0.6);
        sparkRef.current?.spark(x, y);
      }, i * 90);
    }
  }

  return (
    <ClickSpark
      ref={sparkRef}
      disabled={reducedMotion}
      sparkColor={SPARK_COLORS[mode]}
      sparkSize={11}
      sparkRadius={22}
      sparkCount={9}
      duration={480}
      shape="line"
      randomness={0.35}
    >
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fun-toast"
          >
            <FiCommand size={18} style={{ color: "var(--accent-text)", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>Achievement unlocked</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                You know the code. <a href="#contact">Let's build something →</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClickSpark>
  );
}
