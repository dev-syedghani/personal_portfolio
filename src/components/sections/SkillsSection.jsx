import React from "react";
import resumeData from "../../utils/resumeData";
import C, { alpha } from "../../theme";
import { IconForTech } from "../Icons";
import { FadeUp, SkillPill, Section } from "../UI";

export function SkillsSection() {
  const sk = resumeData.skills;
  const groups = [
    { label: "Backend", icon: <IconForTech name="Ruby on Rails" />, items: sk.backend },
    { label: "Frontend", icon: <IconForTech name="React.js" />, items: sk.frontend },
    { label: "Rails Ecosystem Gems", icon: <IconForTech name="gems" />, items: sk.railsGems },
    { label: "Payments", icon: <IconForTech name="Stripe" />, items: sk.payments },
    { label: "Integrations", icon: <IconForTech name="Integrations" />, items: sk.integrations },
    { label: "Testing & DevOps", icon: <IconForTech name="AWS" />, items: sk.testingAndDevOps },
    { label: "Also", icon: <IconForTech name="tools" />, items: sk.also },
  ];

  return (
    <Section id="skills" label="Engineering — Skills" title="Tools of the Trade" subtitle="Click any highlighted pill to see specifics. Skills with ▼ expand on click." tinted watermark="SKILLS">
      {/* The orbiting tech constellation that used to sit here was a second
          "technology topology" visual competing with the real interactive one
          in TechStackSection directly above — same icons, same idea, no extra
          information. Dropped; the flowchart is the canonical system map. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {groups.map((g, i) => (
          <FadeUp key={i} delay={i * 50}>
            <div className="glass" style={{ borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 18, display: "inline-flex", alignItems: "center" }}>{g.icon}</span>
                <h4 style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.secondary, margin: 0 }}>{g.label}</h4>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {g.items.map((skill, j) => (
                  <SkillPill key={j} skill={skill} />
                ))}
              </div>
            </div>
          </FadeUp>
        ))}

        <FadeUp delay={350}>
          <div className="glass" style={{ borderRadius: 16, padding: "20px 24px", borderStyle: "dashed" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <IconForTech name="learning" size={18} />
              <h4 style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.secondary, margin: 0 }}>Currently Learning</h4>
              <span style={{ marginLeft: 4, padding: "2px 8px", borderRadius: 100, fontSize: 10, background: `${alpha(C.copper, "14")}`, border: `1px solid ${alpha(C.copper, "30")}`, color: C.accentText, fontFamily: "'JetBrains Mono',monospace" }}>
                growing
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sk.currentlyLearning.map((skill, j) => (
                <SkillPill key={j} skill={skill} dashed />
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
