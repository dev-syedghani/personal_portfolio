import React from "react";
import { motion } from "framer-motion";
import BlurText from "../components/reactbits/BlurText";

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
