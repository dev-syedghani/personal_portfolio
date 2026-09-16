import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import C, { alpha } from "../theme";
import { IconExternal } from "./Icons";

export function DetailModal({ icon, eyebrow, title, subtitle, children, links, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
          borderRadius: 18,
          maxWidth: 520,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "36px 32px",
          position: "relative",
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

        {icon && (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              marginBottom: 18,
              background: `${alpha(C.copper, "18")}`,
              border: `1px solid ${alpha(C.copper, "40")}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        )}
        {eyebrow && (
          <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: C.secondary, margin: "0 0 6px" }}>
            {eyebrow}
          </p>
        )}
        <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 700, color: C.primary, margin: "0 0 8px" }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 14, color: C.accentText, fontWeight: 600, marginBottom: 20 }}>{subtitle}</p>}

        <div style={{ marginBottom: links && links.length > 0 ? 24 : 0 }}>{children}</div>

        {links && links.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {links.map((l, i) => (
              <a
                key={i}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: C.secondary,
                  textDecoration: "none",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "7px 14px",
                }}
              >
                {l.label} <IconExternal size={12} />
              </a>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}
