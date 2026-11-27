import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowDownRight, FiArrowUpRight, FiMapPin } from "react-icons/fi";
import resumeData from "../../utils/resumeData";
import DotGrid from "../../components/reactbits/DotGrid";
import BlurText from "../../components/reactbits/BlurText";
import RotatingText from "../../components/reactbits/RotatingText";
import DecryptedText from "../../components/reactbits/DecryptedText";
import Magnet from "../../components/reactbits/Magnet";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useThemeMode } from "../../hooks/useThemeMode";

// DotGrid paints on a canvas, so it takes real colours per theme.
const DOTS = {
  dark: { base: "#1e2924", active: "#6ee7b7" },
  light: { base: "#d3d8d2", active: "#059669" },
};

const ROLES = ["SaaS products", "React frontends", "Rails backends", "payment systems"];
const EASE = [0.22, 1, 0.36, 1];

// Built from the résumé's ongoing roles so the strapline can never contradict
// the Experience timeline further down the page.
const CURRENT_LINE = resumeData.experience
  .filter((e) => /present/i.test(e.duration))
  .flatMap((e) =>
    Array.isArray(e.roles) && e.roles.length
      ? e.roles.map((r) => `${r.title ?? r.role} @ ${e.company}`)
      : [`${e.role} @ ${e.company}`]
  )
  .join(" — ");

export function Hero({ ready }) {
  const reduced = usePrefersReducedMotion();
  const dots = DOTS[useThemeMode()];
  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 700], [0, -60]);
  const fade = useTransform(scrollY, [0, 550], [1, 0]);

  const appear = (delay) => ({
    initial: { opacity: 0, y: 14 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section className="hero" id="top">
      {/* Dots ease away from the cursor and spring back; a click sends a ripple. */}
      <div className="hero-bg" aria-hidden="true">
        <DotGrid
          dotSize={2.5}
          gap={24}
          baseColor={dots.base}
          activeColor={dots.active}
          proximity={190}
          strength={1.6}
          shockRadius={260}
          shockStrength={4}
          swell={0.6}
          glow={0.6}
          paused={reduced}
          mouseInteraction={!reduced}
        />
      </div>

      <div className="wrap">
        <motion.div className="hero-grid" style={reduced ? undefined : { y: lift, opacity: fade }}>
          <div>
            <motion.span className="pill" {...appear(0.05)}>
              <span className="live-dot" />
              Available now · remote, worldwide
            </motion.span>

            {ready && (
              <h1 className="display hero-name" aria-label={resumeData.name}>
                <BlurText as="span" text={resumeData.name} delay={70} direction="bottom" blur={12} distance={20} trigger="load" />
              </h1>
            )}

            <motion.div {...appear(0.45)}>
              <p className="hero-sub">
                <span>Full-stack engineer. I build</span>
                <RotatingText
                  texts={ROLES}
                  mainClassName="rotator"
                  staggerFrom="first"
                  staggerDuration={0.015}
                  transition={{ type: "spring", damping: 30, stiffness: 380 }}
                  animatePresenceMode="popLayout"
                  rotationInterval={2800}
                  splitBy="characters"
                  auto={!reduced}
                />
                <span>that ship.</span>
              </p>
              <p className="mono" style={{ color: "var(--dim)", fontSize: 12.5, margin: "0 0 40px", minHeight: 20 }}>
                {ready && (
                  <DecryptedText
                    text={CURRENT_LINE}
                    animateOn="view"
                    sequential
                    speed={22}
                    encryptedClassName="opacity-50"
                  />
                )}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Magnet padding={60} magnetStrength={4} maxOffset={10}>
                  <a href="#contact" className="btn btn-primary cursor-target" data-cursor-label="say hi">
                    Get in touch <FiArrowUpRight size={16} />
                  </a>
                </Magnet>
                <a href="#work" className="btn btn-ghost cursor-target" data-cursor-label="scroll">
                  Selected work <FiArrowDownRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="hero-photo cursor-target"
            data-cursor-label="hi there"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={ready ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.25, ease: EASE }}
          >
            <img src={resumeData.photo} alt={resumeData.name} width={840} height={840} fetchpriority="high" />
            <span className="pill tag"><FiMapPin size={12} /> {resumeData.location}</span>
          </motion.div>
        </motion.div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span /> SCROLL
      </div>
    </section>
  );
}
