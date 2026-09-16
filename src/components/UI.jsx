import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTilt3D } from "../hooks/useTilt3D";
import C, { alpha } from "../theme";
import IconForTech from "./Icons";

export function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 800 }}
      initial={{ opacity: 0, y: 24, rotateX: -8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Every Card on the page is a glass pane — the `.glass` class carries the
// blur/saturate, the specular top edge and the inner shadows, so the look
// stays identical everywhere and lives in one place.
export function Card({ children, hover = true, tilt3D = false, className = "", style = {}, onClick }) {
  const [hov, setHov] = useState(false);
  const { ref, onPointerMove, onPointerLeave, tilt, enabled: tiltEnabled } = useTilt3D();

  const lift = hov ? -3 : 0;
  const transform =
    tilt3D && tiltEnabled
      ? `perspective(1200px) rotateX(${tilt.rx * 0.4}deg) rotateY(${tilt.ry * 0.4}deg) translateY(${lift}px)`
      : `translateY(${lift}px)`;

  return (
    <div
      ref={tilt3D ? ref : undefined}
      className={`glass ${className}`.trim()}
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={(e) => {
        if (hover) setHov(false);
        if (tilt3D) onPointerLeave(e);
      }}
      onPointerMove={tilt3D ? onPointerMove : undefined}
      style={{
        borderRadius: 18,
        transform,
        transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s, transform 0.25s cubic-bezier(0.22,1,0.36,1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SkillPill({ skill, dashed = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);
  // Extra horizontal nudge, on top of the base translateX(-50%) centering,
  // applied only when the centered tooltip would actually clip past the
  // viewport edge — most pills don't need this, but nothing clips overflow
  // here (Section has no overflow:hidden), so a pill near the right edge of
  // its wrapped row on a narrow phone can otherwise push the whole page into
  // horizontal scroll. Measured after paint rather than guessed, since the
  // clipping pill depends on where that specific pill landed in its wrapped
  // row — not knowable from the component's own props.
  const [nudge, setNudge] = useState(0);
  const hasDetail = skill.detail && skill.detail.length > 0;

  useEffect(() => {
    if (!open) {
      setNudge(0);
      return;
    }
    const el = tooltipRef.current;
    if (!el) return;
    const margin = 12;
    const rect = el.getBoundingClientRect();
    let delta = 0;
    if (rect.left < margin) delta = margin - rect.left;
    else if (rect.right > window.innerWidth - margin) delta = window.innerWidth - margin - rect.right;
    if (delta !== 0) setNudge(delta);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => hasDetail && setOpen((o) => !o)}
        style={{
          padding: "7px 14px",
          borderRadius: 100,
          fontSize: 13,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          cursor: hasDetail ? "pointer" : "default",
          background: dashed ? "transparent" : "color-mix(in srgb, var(--secondary) 8%, transparent)",
          border: dashed ? `1.5px dashed ${C.border}` : "1px solid transparent",
          color: dashed ? C.secondary : C.primary,
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          transition: "background 0.2s, border-color 0.2s, color 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "color-mix(in srgb, var(--accent) 14%, transparent)";
          e.currentTarget.style.color = C.accentText;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = dashed ? "transparent" : "color-mix(in srgb, var(--secondary) 8%, transparent)";
          e.currentTarget.style.color = dashed ? C.secondary : C.primary;
        }}
      >
        <IconForTech name={skill.name} size={14} colored={true} />
        <span>{skill.name}</span>
        {hasDetail && (
          <span
            style={{
              fontSize: 9,
              color: C.accentText,
              transform: open ? "rotate(180deg)" : "none",
              display: "inline-block",
              transition: "transform 0.2s",
            }}
          >
            ▼
          </span>
        )}
      </button>

      {hasDetail && open && (
        <div
          ref={tooltipRef}
          className="glass-popover"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: `translateX(calc(-50% + ${nudge}px))`,
            borderRadius: 12,
            padding: "10px 14px",
            minWidth: 180,
            maxWidth: "calc(100vw - 24px)",
            zIndex: 100,
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {skill.detail.map((d, i) => (
              <li key={i} style={{ fontSize: 12, color: C.secondary, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: C.sage, fontSize: 10 }}>✓</span> {d}
              </li>
            ))}
          </ul>
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              // Counter-shifts by the same nudge the box itself moved by, so
              // the arrow keeps pointing at the pill button underneath
              // regardless of how far the box got pushed to stay on-screen.
              transform: `translateX(calc(-50% - ${nudge}px))`,
              width: 10,
              height: 10,
              background: "var(--bg-alt)",
              border: `1px solid ${alpha(C.copper, "40")}`,
              borderTop: "none",
              borderLeft: "none",
              rotate: "45deg",
            }}
          />
        </div>
      )}
    </div>
  );
}

// `watermark` is accepted but no longer rendered — decorative giant background
// text reads as noise, not craft, once the design goal is minimalism. Kept in
// the signature so call sites don't need to change.
export function Section({ id, label, title, subtitle, children, tinted = false, watermark, className = "" }) {
  return (
    <section
      id={id}
      className={`section-block ${className}`.trim()}
      style={{
        position: "relative",
        background: tinted ? "var(--tinted-bg)" : "transparent",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <div className="section-inner" style={{ maxWidth: 1160, margin: "0 auto", position: "relative" }}>
        {label && (
          <FadeUp>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono',monospace",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.secondary,
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              <span aria-hidden="true" style={{ flex: 1, height: 1, background: C.border }} />
            </div>
          </FadeUp>
        )}
        <FadeUp delay={40}>
          <h2
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "clamp(30px,3.6vw,42px)",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: C.primary,
              marginBottom: 12,
              lineHeight: 1.15,
              maxWidth: 720,
            }}
          >
            {title}
          </h2>
        </FadeUp>
        {subtitle && (
          <FadeUp delay={80}>
            <p style={{ color: C.secondary, fontSize: 16, maxWidth: 600, marginBottom: 56, lineHeight: 1.7 }}>
              {subtitle}
            </p>
          </FadeUp>
        )}
        {children}
      </div>
    </section>
  );
}
