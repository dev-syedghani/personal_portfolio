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
import { IconForTech } from "../../components/Icons";
import { Tilt } from "../parts";
import { useThemeMode } from "../../hooks/useThemeMode";

// DotGrid paints on a canvas, so it takes real colours per theme.
const DOTS = {
  dark: { base: "#2a1b1b", active: "#ff7d88" },
  light: { base: "#e4d6d3", active: "#cc1530" },
};

const BADGES = [
  { name: "Ruby on Rails", icon: "Ruby on Rails" },
  { name: "Shopify", icon: "Shopify" },
  { name: "React", icon: "React" },
];

const ROLES = ["Shopify automation", "vendor integrations", "Rails backends", "billing systems"];
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
  const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches;
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
        {/* No scroll fade on phones: the portrait sits below the fold there, so
            it would already be half faded by the time anyone scrolled to it. */}
        <motion.div className="hero-grid" style={reduced || narrow ? undefined : { y: lift, opacity: fade }}>
          <div>
            <motion.span className="pill" {...appear(0.05)}>
              <span className="live-dot" />
              Open to new roles · Lahore &amp; remote
            </motion.span>

            {ready && (
              <h1 className="display hero-name" aria-label={resumeData.name}>
                <BlurText as="span" text={resumeData.name} delay={70} direction="bottom" blur={12} distance={20} trigger="load" />
              </h1>
            )}

            <motion.div {...appear(0.45)}>
              <p className="hero-sub">
                <span>Rails + Shopify engineer. I build</span>
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
                <span>that run themselves.</span>
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

          <div className="hero-visual">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={ready ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.25, ease: EASE }}
            >
              {/* A layered diorama: each layer sits at its own depth (--z) on a
                  preserve-3d stage, so tilting toward the cursor parallaxes
                  them apart. Nothing in this chain may carry filter, opacity<1
                  or overflow, or the stage collapses flat. */}
              <Tilt max={10} glare className="hero-tilt">
                <div className="hero-stage">
                  <span className="hero-plate" aria-hidden="true" />
                  <div className="hero-photo cursor-target" data-cursor-label="hi there">
                    <img src={resumeData.photo} alt={resumeData.name} width={1200} height={1006} fetchpriority="high" decoding="async" />
                    <span className="hero-ring" aria-hidden="true" />
                  </div>
                  <span className="hero-depth hero-tag-layer" style={{ "--z": "56px" }}>
                    <span className="pill tag"><FiMapPin size={12} /> {resumeData.location}</span>
                  </span>

                  {/* What I ship with day to day, floating in front of the portrait. */}
                  {BADGES.map((b, i) => (
                    <span key={b.name} className={`hero-depth hero-badge hero-badge-${i + 1}`} style={{ "--z": `${[90, 70, 110][i]}px` }} aria-hidden="true">
                      <motion.span
                        style={{ display: "block" }}
                        initial={{ opacity: 0, scale: 0.6, y: 12 }}
                        animate={ready ? { opacity: 1, scale: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.9 + i * 0.15, ease: EASE }}
                      >
                        <span className="hero-badge-in">
                          <IconForTech name={b.icon} size={15} colored={false} />
                          {b.name}
                        </span>
                      </motion.span>
                    </span>
                  ))}
                </div>
              </Tilt>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span /> SCROLL
      </div>
    </section>
  );
}
