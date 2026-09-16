import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import resumeData from "../../utils/resumeData";
import C from "../../theme";
import { useGemStatsContext } from "../../context/GemStatsContext";
import { IconArrow } from "../Icons";
import { TypewriterText } from "./TypewriterText";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { usePointerFine } from "../../hooks/usePointerFine";
import { useTilt3D } from "../../hooks/useTilt3D";

// A soft radial light that drifts toward the cursor — depth, not decoration.
// Gated to fine-pointer, non-reduced-motion devices; a static centered glow
// stands in everywhere else.
function AmbientLight() {
  const ref = useRef(null);
  const fine = usePointerFine();
  const reducedMotion = usePrefersReducedMotion();
  const enabled = fine && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: enabled
          ? "radial-gradient(600px circle at var(--mx,70%) var(--my,30%), rgba(139,140,255,0.06), transparent 60%)"
          : "radial-gradient(700px circle at 70% 20%, rgba(139,140,255,0.05), transparent 60%)",
        transition: enabled ? "none" : "background 0.6s ease",
      }}
    />
  );
}

// Small floating glass data panel — the hero's stats aren't a row under the
// fold, they're scattered around the composition like readouts on a surface.
function FloatingStat({ value, label, style }) {
  return (
    <motion.div
      className="glass"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        borderRadius: 14,
        padding: "10px 16px",
        textAlign: "left",
        ...style,
      }}
    >
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 600, color: C.primary, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: C.secondary, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>{label}</div>
    </motion.div>
  );
}

export function HeroSection() {
  const { displayTotal, isLive } = useGemStatsContext();
  const portraitTilt = useTilt3D({ max: 6 });

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 110, paddingBottom: 80 }}>
      <AmbientLight />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", padding: "0 24px", width: "100%" }}>
        <div className="hero-composition">
          {/* Text column */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 13,
                color: C.secondary,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              Software Engineer
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Inter',sans-serif",
                fontWeight: 800,
                fontSize: "clamp(64px, 11vw, 148px)",
                lineHeight: 0.86,
                letterSpacing: "-0.03em",
                color: C.primary,
                margin: 0,
              }}
            >
              SYED
              <br />
              GHANI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(16px,1.8vw,20px)",
                color: C.secondary,
                maxWidth: 460,
                margin: "28px 0 0",
                lineHeight: 1.5,
              }}
            >
              I build production software for real businesses — Ruby on Rails and React, end to end.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: C.accentText, marginTop: 16, minHeight: 20 }}
            >
              <TypewriterText words={resumeData.titles} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ marginTop: 40 }}
            >
              <a
                id="hero-view-work"
                href="#case-studies"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "13px 24px",
                  background: C.primary,
                  color: C.bg,
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'Inter',sans-serif",
                  textDecoration: "none",
                }}
              >
                Explore work <IconArrow />
              </a>
            </motion.div>
          </div>

          {/* Portrait — deliberately breaks out of the text column's grid line,
              tilts in 3D toward the cursor, and carries floating glass stat
              panels anchored to its edges. The panels sit *outside* the
              tilted element (their own layer, undoing the rotation) so they
              read as hovering just in front of the glass, not glued flat to
              a rotating surface. */}
          <div className="hero-portrait-wrap">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "relative" }}
            >
              <div
                ref={portraitTilt.ref}
                onPointerMove={portraitTilt.onPointerMove}
                onPointerLeave={portraitTilt.onPointerLeave}
                style={{
                  width: "100%",
                  aspectRatio: "3/4",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: `1px solid ${C.border}`,
                  transform: portraitTilt.enabled
                    ? `perspective(1200px) rotateX(${portraitTilt.tilt.rx}deg) rotateY(${portraitTilt.tilt.ry}deg)`
                    : "none",
                  transition: "transform 0.2s ease-out",
                }}
              >
                <img
                  src={resumeData.photo}
                  alt="Syed M. Ghani — Ruby on Rails & React Engineer, Lahore"
                  fetchpriority="high"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
                />
              </div>

              <FloatingStat value="7" label="Products" style={{ top: -18, left: -28 }} />
              <FloatingStat value="4" label="Rails gems" style={{ bottom: 64, left: -36 }} />
              <FloatingStat
                value={`${displayTotal}+`}
                label={isLive ? "Downloads (live)" : "Downloads"}
                style={{ bottom: -16, right: -20 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Corner metadata — floating, not stacked under the CTA. */}
        <div className="hero-corner hero-corner--tl">
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.secondary, letterSpacing: "0.06em" }}>
            Lahore / Remote
          </span>
        </div>
        <div className="hero-corner hero-corner--bl">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "inline-block" }} />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.secondary, letterSpacing: "0.06em" }}>
            Available for work
          </span>
        </div>
      </div>
    </section>
  );
}
