import React from "react";
import { motion } from "framer-motion";
import resumeData from "../../utils/resumeData";
import C, { alpha } from "../../theme";
import { FadeUp, Section } from "../UI";
import { socialLinks } from "../../data/sectionsData";
import { IconLocation, IconGlobe, IconForTech, getTechColor } from "../Icons";
import { useGemStatsContext } from "../../context/GemStatsContext";
import { useScrollParallax } from "../../hooks/useScrollParallax";

export function AboutSection() {
  const { displayTotal, loading } = useGemStatsContext();
  const gemDownloads = loading ? "5,993" : displayTotal;
  const { ref: photoParallaxRef, y: photoParallaxY } = useScrollParallax(30);

  // Render summary with dynamic gem download count
  const summaryParts = resumeData.summary.split("{GEM_DOWNLOADS}");

  return (
    <Section id="about" label="07 / About" title="Who You're Hiring" watermark="ABOUT">
      <div className="about-grid">
        <FadeUp>
          <motion.div ref={photoParallaxRef} style={{ position: "relative", maxWidth: 260, y: photoParallaxY }}>
            <div style={{ width: "100%", aspectRatio: "1", borderRadius: 18, overflow: "hidden", background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.28)" }}>
              <img
                src={resumeData.photo}
                alt="Syed M. Ghani — Ruby on Rails & React Engineer, Lahore"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${C.surface};font-family:'Inter',sans-serif;font-size:52px;font-weight:800;color:${C.copper}">SG</div>`;
                }}
              />
            </div>
            <div style={{ position: "absolute", bottom: -14, right: -14, padding: "8px 16px", borderRadius: 8, background: C.primary, color: C.bg, fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
              GMT+5 · Remote ✓
            </div>
          </motion.div>
        </FadeUp>

        <FadeUp delay={100}>
          <div>
            <p style={{ fontSize: 17, color: C.secondary, lineHeight: 1.8, marginBottom: 16 }}>
              {summaryParts[0]}
              <strong style={{ color: C.accentText }}>{gemDownloads}</strong>
              {summaryParts[1]}
            </p>
            <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.75, marginBottom: 28 }}>{resumeData.aboutExtra}</p>

            <div style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 12, marginBottom: 32, background: `${alpha(C.copper, "0C")}`, border: `1px solid ${alpha(C.copper, "30")}`, color: C.accentText, fontSize: 14, fontWeight: 600 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IconLocation size={14} /> Lahore, Pakistan
              </span>
              <span style={{ color: C.border }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IconGlobe size={14} /> Remote worldwide
              </span>
              <span style={{ color: C.border }}>·</span>
              <span>GMT+5 · EU/US overlap available</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
              {resumeData.engineeringPractices.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: C.secondary }}>
                  <span style={{ color: C.sage, flexShrink: 0 }}>✓</span>
                  {p}
                </div>
              ))}
            </div>

            <div className="glass" style={{ padding: "16px 20px", borderRadius: 14, marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.12em", color: C.secondary, margin: "0 0 6px" }}>Education</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: C.primary, fontSize: 14, margin: "0 0 2px" }}>{resumeData.education[0].degree}</p>
              <p style={{ color: C.accentText, fontSize: 13, margin: 0 }}>{resumeData.education[0].institution} · {resumeData.education[0].duration}</p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {socialLinks.map((link) => {
                const brandColor = getTechColor(link.type);
                return (
                  <a
                    key={link.label}
                    id={`about-${link.label.toLowerCase()}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 18px",
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      color: C.primary,
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: "none",
                      background: C.surface,
                      transition: "border-color 0.2s, color 0.2s, background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${brandColor}80`;
                      e.currentTarget.style.color = brandColor;
                      e.currentTarget.style.background = `${brandColor}0F`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.color = C.primary;
                      e.currentTarget.style.background = C.surface;
                    }}
                  >
                    <IconForTech name={link.type} size={16} colored={true} />
                    <span>{link.display || link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
