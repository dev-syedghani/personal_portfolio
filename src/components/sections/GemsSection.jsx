import React, { useState } from "react";
import resumeData from "../../utils/resumeData";
import C, { alpha } from "../../theme";
import { useGemStatsContext } from "../../context/GemStatsContext";
import { IconGem } from "../Icons";
import { FadeUp, Section } from "../UI";
import { DetailModal } from "../DetailModal";

function GemRow({ gem, displayCount, onOpen }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        width: "100%",
        textAlign: "left",
        padding: "22px 4px",
        background: "none",
        border: "none",
        borderBottom: `1px solid ${C.border}`,
        borderLeft: `2px solid ${hov ? C.copper : "transparent"}`,
        paddingLeft: hov ? 16 : 18,
        cursor: "pointer",
        transition: "border-color 0.2s, padding-left 0.2s",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: hov ? 6 : 0, transition: "margin 0.2s" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 16, color: C.primary }}>{gem.name}</span>
          <span style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{gem.version}</span>
        </div>
        <div
          style={{
            fontSize: 13,
            color: C.secondary,
            maxHeight: hov ? 60 : 0,
            opacity: hov ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.25s ease, opacity 0.2s",
          }}
        >
          {gem.tagline}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 600, color: C.primary }}>{displayCount}</div>
        <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>downloads</div>
      </div>
    </button>
  );
}

export function GemsSection() {
  const { counts, displayTotal, isLive, loading, formatCount } = useGemStatsContext();
  const gems = resumeData.openSource.gems;
  const [active, setActive] = useState(null);

  return (
    <Section id="gems" label="03 / Open Source" title="Built for the Ecosystem" subtitle={`${loading ? "…" : displayTotal + "+"} total downloads${isLive ? " (live from RubyGems)" : ""} — production tools built for real pain points, not tutorials.`} tinted watermark="GEMS">
      <FadeUp>
        <div>
          {gems.map((gem) => {
            const liveCount = counts[gem.name];
            const displayCount = liveCount != null ? formatCount(liveCount) : loading ? "…" : "—";
            return <GemRow key={gem.name} gem={gem} displayCount={displayCount} onOpen={() => setActive(gem)} />;
          })}
        </div>
      </FadeUp>
      <FadeUp delay={280}>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            href={resumeData.rubygemsProfile}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: C.secondary,
              textDecoration: "none",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "10px 22px",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.accentText;
              e.currentTarget.style.borderColor = `${alpha(C.copper, "50")}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.secondary;
              e.currentTarget.style.borderColor = C.border;
            }}
          >
            View RubyGems profile
          </a>
        </div>
      </FadeUp>

      {active && (
        <DetailModal
          icon={<IconGem />}
          eyebrow={`${active.version}${active.badge ? ` · ${active.badge}` : ""}`}
          title={active.name}
          subtitle={active.tagline}
          links={[
            { label: "GitHub", href: active.github },
            { label: "RubyGems", href: active.rubygems },
          ]}
          onClose={() => setActive(null)}
        >
          <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.65, marginBottom: 16 }}>{active.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {active.tech.map((t, j) => (
              <span key={j} style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, color: C.secondary, background: C.bg, border: `1px solid ${C.border}` }}>
                {t}
              </span>
            ))}
          </div>
        </DetailModal>
      )}
    </Section>
  );
}
