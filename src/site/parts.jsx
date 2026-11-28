import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import BlurText from "../components/reactbits/BlurText";
import { usePointerFine } from "../hooks/usePointerFine";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * Spring-driven 3D tilt toward the pointer (React Bits "Tilted Card"). With
 * `glare`, a soft highlight follows the pointer across the face, written to
 * CSS vars so it costs no re-render. Off for touch and reduced motion.
 */
export function Tilt({ children, max = 7, scale = 1, glare = false, className = "", style }) {
  const fine = usePointerFine();
  const reduced = usePrefersReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const s = useMotionValue(1);
  const rotateX = useSpring(rx, { stiffness: 220, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 220, damping: 18 });
  const sc = useSpring(s, { stiffness: 260, damping: 20 });
  const on = fine && !reduced;

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx.set(-(py - 0.5) * max * 2);
    ry.set((px - 0.5) * max * 2);
    s.set(scale);
    if (glare) {
      e.currentTarget.style.setProperty("--gx", `${px * 100}%`);
      e.currentTarget.style.setProperty("--gy", `${py * 100}%`);
    }
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
    s.set(1);
  };

  return (
    <motion.div
      className={`${glare ? "tilt-glare " : ""}${className}`}
      style={{ height: "100%", rotateX: on ? rotateX : 0, rotateY: on ? rotateY : 0, scale: on ? sc : 1, transformPerspective: 900, ...style }}
      onPointerMove={on ? move : undefined}
      onPointerLeave={on ? reset : undefined}
    >
      {children}
    </motion.div>
  );
}

const EASE = [0.22, 1, 0.36, 1];

/** Fades and lifts its children in once they scroll into view. */
export function Reveal({ children, delay = 0, y = 28, className = "", style, as = "div" }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/**
 * Section heading: an eyebrow, a two-tone title that blurs in word by word,
 * and an optional lead paragraph. `accent` is set on its own line in a muted
 * serif italic, after `title`.
 */
export function SectionHead({ eyebrow, title, accent, lead, children }) {
  return (
    <div className="sec-head">
      <Reveal>
        <span className="eyebrow">{eyebrow}</span>
      </Reveal>
      <h2 className="h2">
        <BlurText as="span" text={title} delay={60} direction="bottom" blur={10} distance={18} threshold={0.3} />
        {accent && (
          <span className="serif" style={{ display: "block" }}>
            <BlurText as="span" text={accent} delay={60} direction="bottom" blur={10} distance={18} threshold={0.3} />
          </span>
        )}
      </h2>
      {lead && (
        <Reveal delay={0.15}>
          <p className="lead" style={{ margin: 0 }}>{lead}</p>
        </Reveal>
      )}
      {children}
    </div>
  );
}
