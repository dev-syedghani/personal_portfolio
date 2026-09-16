import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import resumeData from "../../utils/resumeData";
import C, { alpha } from "../../theme";
import { IconExternal } from "../Icons";
import { Section } from "../UI";

const CLAMP_LINES = 5;

function TestimonialModal({ t, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Rendered via portal: Section now has overflow:hidden for the background watermark,
  // which visually clips position:fixed descendants in real browsers — escape to document.body.
  return createPortal(
    <motion.div
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4,5,7,0.55)",
        backdropFilter: "blur(10px) saturate(140%)", WebkitBackdropFilter: "blur(10px) saturate(140%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
        perspective: 1200,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="glass-heavy"
        initial={{ opacity: 0, rotateY: 180, scale: 0.6 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: 16,
          maxWidth: 560,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "40px 36px 32px",
          position: "relative",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: `1px solid ${alpha(C.copper, "40")}`,
            background: "transparent",
            color: C.primary,
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>

        <div style={{ fontSize: 48, color: `${alpha(C.copper, "25")}`, fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: 8 }}>"</div>

        <p style={{ fontSize: 15, color: `${alpha(C.primary, "DD")}`, lineHeight: 1.9, fontStyle: "italic", marginBottom: 28, whiteSpace: "pre-line" }}>
          {t.quote}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: C.primary, fontSize: 15, margin: "0 0 4px" }}>{t.author}</p>
            <p style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: C.secondary, margin: 0 }}>{t.title}</p>
          </div>
          {t.url && (
            <a
              href={t.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: C.accentText,
                textDecoration: "none",
                border: `1px solid ${alpha(C.copper, "40")}`,
                borderRadius: 8,
                padding: "8px 12px",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {t.type === "post" && "view post"}
              {t.type === "profile" && "view profile"}
              <IconExternal size={12} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// One large quote at a time, crossfaded — not a grid or carousel of cards.
// A row of small identity buttons underneath switches who's speaking.
function QuoteDisplay({ t, onExpand }) {
  const [isLong, setIsLong] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * CLAMP_LINES;
      setIsLong(textRef.current.scrollHeight > maxHeight + 2);
    }
  }, [t]);

  return (
    <motion.div
      key={t.author}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <p
        ref={textRef}
        style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: "clamp(20px,2.6vw,30px)",
          fontWeight: 500,
          color: C.primary,
          lineHeight: 1.45,
          letterSpacing: "-0.01em",
          marginBottom: 24,
          maxWidth: 760,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: CLAMP_LINES,
          overflow: "hidden",
        }}
      >
        "{t.quote}"
      </p>

      {isLong && (
        <button
          onClick={onExpand}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginBottom: 24,
            fontSize: 12,
            fontFamily: "'JetBrains Mono',monospace",
            color: C.accentText,
            cursor: "pointer",
          }}
        >
          Read full testimonial →
        </button>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, color: C.primary, fontSize: 15, margin: "0 0 2px" }}>{t.author}</p>
          <p style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: C.secondary, margin: 0 }}>{t.title}</p>
        </div>
        {t.url && (
          <a
            href={t.url}
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.secondary, textDecoration: "none" }}
          >
            {t.type === "post" ? "view post" : "view profile"} <IconExternal size={11} />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const [localTestimonials] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userTestimonials") || "[]");
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("userTestimonials", JSON.stringify(localTestimonials));
    } catch (e) {}
  }, [localTestimonials]);

  const testimonials = [...localTestimonials, ...resumeData.testimonials];
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const active = testimonials[index];

  return (
    <Section id="testimonials" label="06 / People" title="What They Say" subtitle="From people who worked with me directly." tinted watermark="PROOF">
      <div style={{ minHeight: 220 }}>
        <AnimatePresence mode="wait">
          <QuoteDisplay key={index} t={active} onExpand={() => setExpanded(true)} />
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 40, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
        {testimonials.map((t, i) => (
          <button
            key={t.author + i}
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial from ${t.author}`}
            aria-current={i === index}
            style={{
              padding: "6px 14px",
              borderRadius: 100,
              border: `1px solid ${i === index ? C.secondary : C.border}`,
              background: "none",
              color: i === index ? C.primary : C.muted,
              fontSize: 12,
              fontFamily: "'Inter',sans-serif",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "border-color 0.2s, color 0.2s",
            }}
          >
            {t.author}
          </button>
        ))}
      </div>

      {expanded && <TestimonialModal t={active} onClose={() => setExpanded(false)} />}
    </Section>
  );
}
