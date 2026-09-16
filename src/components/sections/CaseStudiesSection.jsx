import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import resumeData from "../../utils/resumeData";
import C from "../../theme";
import { FadeUp, Section } from "../UI";
import { ProjectModal } from "../ProjectModal";
import { getScreenshotUrl } from "../../utils/screenshot";
import { AutoProjectImage } from "../AutoProjectImage";
import { useTilt3D } from "../../hooks/useTilt3D";

// The one project flagged `flagship: true` in resumeData (CinnaLab) gets a
// dedicated, larger treatment above the case-study browser instead of being
// just another coverflow card — sole-engineer, 8-months-to-production. The
// interactive architecture diagram lives once, in the Engineering section
// below (its nodes already reflect CinnaLab's real stack) — this block links
// to it instead of mounting a second copy of the same diagram.
function FlagshipCaseStudy({ project }) {
  return (
    <div
      className="glass"
      style={{
        marginBottom: 64,
        padding: "40px 32px",
        borderRadius: 20,
      }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 100,
              border: `1px solid ${C.border}`,
              color: C.secondary,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'Inter',sans-serif",
            }}
          >
            Flagship
          </span>
          <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: C.secondary, letterSpacing: "0.04em" }}>
            {project.role} · From architecture to production
          </span>
        </div>

        <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(24px,3vw,34px)", fontWeight: 600, letterSpacing: "-0.01em", color: C.primary, margin: "0 0 20px" }}>
          {project.name}
        </h3>

        {project.problem && (
          <p style={{ fontSize: 15, color: C.secondary, fontStyle: "italic", lineHeight: 1.75, marginBottom: 24, paddingLeft: 18, borderLeft: `2px solid ${C.border}`, maxWidth: 760 }}>
            {project.problem}
          </p>
        )}

        {project.metrics && project.metrics.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 10, marginBottom: 32 }}>
            {project.metrics.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, fontWeight: 600, color: C.sage }}>
                <span style={{ flexShrink: 0 }}>✓</span> {m}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                borderRadius: 8,
                background: C.primary,
                color: C.bg,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Inter',sans-serif",
                textDecoration: "none",
              }}
            >
              Visit CinnaLab.io ↗
            </a>
          )}
          <a
            href="#rails-showcase"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              color: C.primary,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'Inter',sans-serif",
              textDecoration: "none",
            }}
          >
            See the architecture ↓
          </a>
        </div>
    </div>
  );
}

// Numbered index list on the left, large preview on the right (stacked on
// narrow screens via .project-browser in index.css) — a curated archive to
// step through, not a uniform grid of identical cards. Exported so
// ProjectsSection (personal work) can reuse the same browser pattern instead
// of a second, differently-shaped carousel.
export function IndexRow({ project, index, isActive, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        width: "100%",
        textAlign: "left",
        padding: "16px 4px",
        background: "none",
        border: "none",
        borderBottom: `1px solid ${C.border}`,
        borderLeft: `2px solid ${isActive ? C.copper : "transparent"}`,
        paddingLeft: isActive ? 16 : 18,
        cursor: "pointer",
        transition: "border-color 0.2s, padding-left 0.2s",
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 12,
          color: isActive ? C.accentText : C.muted,
          flexShrink: 0,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        style={{
          fontFamily: "'Inter',sans-serif",
          fontWeight: isActive ? 700 : 500,
          fontSize: isActive ? 18 : 16,
          color: isActive ? C.primary : C.secondary,
          transition: "font-size 0.2s, color 0.2s",
        }}
      >
        {project.name}
      </span>
    </button>
  );
}

// One large feature card, two medium, one wide banner — a real bento wall,
// not four equal boxes. Sizes are fixed to the grid areas below rather than
// derived from content, so it stays a deliberate composition regardless of
// which four projects land in it.
const BENTO_AREAS = ["a", "b", "c", "d"];

function BentoCard({ project, area, onOpen }) {
  const isLarge = area === "a";
  const { ref, onPointerMove, onPointerLeave, tilt, enabled } = useTilt3D({ max: isLarge ? 4 : 6 });
  return (
    <div
      ref={ref}
      onClick={onOpen}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="glass"
      style={{
        gridArea: area,
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: area === "d" ? "row" : "column",
        transform: enabled ? `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)` : "none",
        transition: "transform 0.2s ease-out",
      }}
    >
      <div
        style={{
          position: "relative",
          flex: area === "d" ? "0 0 42%" : "1 1 auto",
          minHeight: area === "d" ? 160 : isLarge ? 260 : 140,
          background: C.bg,
        }}
      >
        {project.image ? (
          <img
            src={project.image}
            alt={project.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : null}
      </div>
      <div style={{ padding: isLarge ? "24px 26px" : "18px 20px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "flex-end" }}>
        <h3
          style={{
            fontFamily: "'Inter',sans-serif",
            fontWeight: 600,
            fontSize: isLarge ? "clamp(20px,2.2vw,26px)" : 16,
            color: C.primary,
            margin: "0 0 6px",
          }}
        >
          {project.name}
        </h3>
        {isLarge && project.description && (
          <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6, margin: "0 0 8px", maxWidth: 480 }}>{project.description}</p>
        )}
        <span style={{ fontSize: 12, color: C.accentText, fontFamily: "'JetBrains Mono',monospace" }}>View case study →</span>
      </div>
    </div>
  );
}

export function PreviewPane({ project, onOpen }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={project.name}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          onClick={onOpen}
          style={{
            borderRadius: 18,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
            background: C.surface,
            cursor: "pointer",
            boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", background: C.bg }}>
            {project.image ? (
              <img
                src={project.image}
                alt={project.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
            ) : null}
            <div style={{ display: project.image ? "none" : "block", position: "absolute", inset: 0 }}>
              <AutoProjectImage name={project.name} tech={project.tech} />
            </div>
          </div>
          <div style={{ padding: "22px 26px 26px" }}>
            {project.description && (
              <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.65, margin: "0 0 16px" }}>{project.description}</p>
            )}
            {project.tech && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {project.tech.slice(0, 6).map((t, i) => (
                  <span key={i} style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, color: C.secondary, background: C.bg, border: `1px solid ${C.border}` }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <span style={{ fontSize: 12, color: C.accentText, fontFamily: "'JetBrains Mono',monospace" }}>View full case study →</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function CaseStudiesSection() {
  // The Blackstack entry, specifically — not just "the first experience
  // entry": that assumption broke the moment a newer role (Stackworx, no
  // .projects array of its own) got added ahead of it in the timeline.
  const bsExp = resumeData.experience.find((e) => e.company === "Blackstack Software Solutions");
  const flagship = bsExp.projects.find((p) => p.flagship);
  // Everything except the flagship — it already gets its own dedicated block above.
  const projects = bsExp.projects.filter((p) => !p.flagship).map((p) => ({ ...p, image: getScreenshotUrl(p.url) }));
  const [openProject, setOpenProject] = useState(null);

  return (
    <Section id="case-studies" label="01 / Selected Work" title="Products I've Built" subtitle="Five production SaaS builds — sole or primary engineer, shipped and running." watermark="WORK">
      {flagship && <FlagshipCaseStudy project={flagship} />}

      <FadeUp>
        <div className="bento-work">
          {projects.map((p, i) => (
            <BentoCard key={p.name} project={p} area={BENTO_AREAS[i]} onOpen={() => setOpenProject(p)} />
          ))}
        </div>
      </FadeUp>

      {openProject && <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />}
    </Section>
  );
}
