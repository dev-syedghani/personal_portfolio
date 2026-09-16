import React from "react";
import C, { alpha } from "../../theme";
import { IconForTech } from "../Icons";
import { FadeUp, Section } from "../UI";
import { FlipCard } from "../FlipCard";
import { processSteps } from "../../data/sectionsData";

export function ProcessSection() {
  return (
    <Section id="process" label="Engineering — Process" title="How I Work" subtitle="A predictable, low-overhead process — for a Lahore hiring manager or a remote founder. Hover a card for the details." watermark="PROCESS">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14 }}>
        {processSteps.map((s, i) => (
          <FadeUp key={i} delay={i * 80}>
            <FlipCard
              front={
                <div style={{ padding: 28, display: "flex", flexDirection: "column", flex: 1, position: "relative", overflow: "hidden", alignItems: "center", textAlign: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, borderBottomLeftRadius: 24, background: `${alpha(C.copper, "08")}` }} />
                  <div style={{ fontSize: 28, marginBottom: 14 }}>
                    <IconForTech name={s.iconName} />
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: `${alpha(C.copper, "90")}`, marginBottom: 8 }}>{s.n}</div>
                  <h4 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: C.primary, fontSize: 16, margin: 0 }}>{s.title}</h4>
                  <p style={{ fontSize: 11, color: C.accentText, marginTop: 14, fontFamily: "'JetBrains Mono',monospace" }}>Hover for details →</p>
                </div>
              }
              back={
                <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
                  <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: `${alpha(C.copper, "90")}`, marginBottom: 8 }}>{s.n}</div>
                  <h4 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: C.primary, marginBottom: 10, fontSize: 15 }}>{s.title}</h4>
                  <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              }
            />
          </FadeUp>
        ))}
      </div>
    </Section>
  );
}
