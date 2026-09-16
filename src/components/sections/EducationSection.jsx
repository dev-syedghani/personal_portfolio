import React from "react";
import resumeData from "../../utils/resumeData";
import C, { alpha } from "../../theme";
import { IconEducation } from "../Icons";
import { FadeUp, Section } from "../UI";
import { FlipCard } from "../FlipCard";

export function EducationSection() {
  return (
    <Section id="education" label="About — Education" title="Education" subtitle="Hover for coursework and final year project." tinted watermark="EDUCATION">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16, maxWidth: 560, margin: "0 auto" }}>
        {resumeData.education.map((edu, i) => (
          <FadeUp key={i} delay={i * 60}>
            <FlipCard
              front={
                <div style={{ padding: 32, display: "flex", flexDirection: "column", flex: 1, alignItems: "center", textAlign: "center", justifyContent: "center" }}>
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
                    <IconEducation size={24} />
                  </div>
                  <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: C.primary, fontSize: 18, margin: "0 0 6px" }}>{edu.degree}</h3>
                  <p style={{ color: C.accentText, fontWeight: 600, margin: "0 0 4px", fontSize: 14 }}>{edu.institution}</p>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.secondary }}>{edu.duration}</span>
                  <p style={{ fontSize: 11, color: C.accentText, marginTop: 16, fontFamily: "'JetBrains Mono',monospace" }}>Hover for details →</p>
                </div>
              }
              back={
                <div style={{ padding: 28, display: "flex", flexDirection: "column", flex: 1 }}>
                  {edu.fyp && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: C.secondary, margin: "0 0 6px" }}>
                        Final Year Project
                      </p>
                      <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, margin: 0 }}>
                        <strong style={{ color: C.primary }}>{edu.fyp.name}:</strong> {edu.fyp.description}
                      </p>
                    </div>
                  )}
                  {edu.coursework && (
                    <div>
                      <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: C.secondary, margin: "0 0 8px" }}>
                        Coursework
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {edu.coursework.map((c, ci) => (
                          <span key={ci} style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, color: C.secondary, background: C.bg, border: `1px solid ${C.border}` }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              }
            />
          </FadeUp>
        ))}
      </div>
    </Section>
  );
}
