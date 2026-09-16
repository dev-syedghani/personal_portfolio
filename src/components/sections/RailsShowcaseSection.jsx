import React, { useState } from "react";
import resumeData from "../../utils/resumeData";
import C from "../../theme";
import { FadeUp, Card, Section } from "../UI";
import { DetailModal } from "../DetailModal";
import { IconForTech, getTechColor } from "../Icons";

export function RailsShowcaseSection() {
  const [active, setActive] = useState(null);

  return (
    <Section id="rails-showcase" label="02 / Engineering" title="I Build Systems, Not Just Features" subtitle="Not a skills checklist — concrete proof of depth across architecture, data, payments, and security. Click a card for the details." tinted watermark="RAILS">
      <div className="rails-grid" style={{ marginBottom: 24 }}>
        {resumeData.railsProficiency.map((pillar, i) => {
          const accentColor = getTechColor(pillar.icon);
          return (
            <FadeUp key={i} delay={i * 80}>
              <Card
                hover
                tilt3D
                onClick={() => setActive(pillar)}
                style={{ padding: 28, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    marginBottom: 18,
                    background: `${accentColor}18`,
                    border: `1px solid ${accentColor}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${accentColor}20`,
                  }}
                >
                  <IconForTech name={pillar.icon} size={24} />
                </div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: C.primary, fontSize: 17, margin: 0 }}>{pillar.title}</h3>
                <p style={{ fontSize: 11, color: C.accentText, marginTop: 14, fontFamily: "'JetBrains Mono',monospace" }}>Click for details →</p>
              </Card>
            </FadeUp>
          );
        })}
      </div>
      <FadeUp delay={320}>
        <div
          style={{
            textAlign: "center",
            padding: "36px 32px",
            borderRadius: 12,
          }}
        >
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(19px,2.4vw,26px)", fontStyle: "italic", fontWeight: 500, color: C.primary, margin: 0, lineHeight: 1.5 }}>
            "{resumeData.railsClosingLine}"
          </p>
        </div>
      </FadeUp>

      {active && (
        <DetailModal
          icon={<IconForTech name={active.icon} size={24} />}
          eyebrow="Technical Depth"
          title={active.title}
          onClose={() => setActive(null)}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {active.points.map((pt, pi) => (
              <li key={pi} style={{ display: "flex", gap: 10, fontSize: 14, color: C.secondary, lineHeight: 1.55 }}>
                <span style={{ color: C.sage, flexShrink: 0, marginTop: 2 }}>✓</span>
                {pt}
              </li>
            ))}
          </ul>
        </DetailModal>
      )}
    </Section>
  );
}
