import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import C, { alpha } from "../theme";
import { IconExternal } from "./Icons";
import { AutoProjectImage } from "./AutoProjectImage";

export function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { name, image, images, url, githubUrl, flagship, role, problem, description, metrics, tech } = project;
  const linkHref = url || githubUrl;
  const linkLabel = url ? "Visit site" : "View on GitHub";

  // Projects with multiple screenshots get a thumbnail strip; single-image and
  // no-image projects fall through to the existing single-shot / placeholder path.
  const gallery = images && images.length > 1 ? images : null;
  const [shot, setShot] = useState(0);
  const activeImage = gallery ? gallery[shot] : image;

  // Rendered via portal: Section has overflow:hidden for the background watermark, which
  // visually clips position:fixed descendants in real browsers — escape to document.body.
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
          maxWidth: 640,
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
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
            background: "rgba(0,0,0,0.4)",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          ×
        </button>

        <div style={{ width: "100%", aspectRatio: "16/10", overflow: "hidden", position: "relative", background: C.surface }}>
          {activeImage ? (
            <img
              key={activeImage}
              src={activeImage}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <AutoProjectImage name={name} tech={tech} />
          )}
          {flagship && (
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                padding: "5px 12px",
                borderRadius: 100,
                background: C.gold,
                color: C.onGold,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Flagship{role ? ` · ${role}` : ""}
            </div>
          )}
        </div>

        {gallery && (
          <div style={{ display: "flex", gap: 8, padding: "12px 32px 0" }}>
            {gallery.map((src, i) => (
              <button
                key={src}
                onClick={() => setShot(i)}
                aria-label={`View screenshot ${i + 1}`}
                style={{
                  flex: 1,
                  aspectRatio: "16/10",
                  padding: 0,
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                  background: C.surface,
                  border: `1px solid ${i === shot ? C.copper : C.border}`,
                  opacity: i === shot ? 1 : 0.55,
                  transition: "opacity 0.2s, border-color 0.2s",
                }}
              >
                <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: "28px 32px 32px" }}>
          <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 24, fontWeight: 700, color: C.primary, margin: "0 0 16px" }}>{name}</h3>

          {problem && (
            <p style={{ fontSize: 14, color: C.secondary, fontStyle: "italic", lineHeight: 1.75, marginBottom: 20, paddingLeft: 16, borderLeft: `2px solid ${C.border}` }}>
              {problem}
            </p>
          )}

          {!problem && description && (
            <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.75, marginBottom: 20 }}>{description}</p>
          )}

          {metrics && metrics.length > 0 && (
            <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {metrics.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, fontWeight: 600, color: C.sage }}>
                  <span style={{ flexShrink: 0 }}>✓</span> {m}
                </div>
              ))}
            </div>
          )}

          {tech && tech.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, paddingTop: 20, marginBottom: 24, borderTop: `1px solid ${C.border}` }}>
              {tech.map((t, i) => (
                <span key={i} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, color: C.secondary, background: C.bg, border: `1px solid ${C.border}` }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {linkHref && (
            <a
              href={linkHref}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                borderRadius: 12,
                background: C.primary,
                color: C.bg,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Inter',sans-serif",
                textDecoration: "none",
              }}
            >
              {linkLabel} <IconExternal />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
