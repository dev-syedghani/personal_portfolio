import React from "react";
import LogoLoop from "../../components/reactbits/LogoLoop";
import { IconForTech } from "../../components/Icons";
import { useThemeMode } from "../../hooks/useThemeMode";

// One soft emerald light that follows the cursor across each card. SpotlightCard
// paints with real colours, so the tint is picked per theme.
export function useSpot() {
  const mode = useThemeMode();
  return {
    theme: mode,
    spotlightColor: mode === "dark" ? "#ff4258" : "#cc1530",
    intensity: mode === "dark" ? 0.09 : 0.22,
    spotlightSize: 380,
    borderGlow: 0.6,
    style: {
      "--spotlight-card-surface": "var(--card)",
      "--spotlight-card-border": "var(--line)",
      "--spotlight-card-shadow": "none",
      borderRadius: 18,
      padding: 28,
      height: "100%",
    },
  };
}

// `icon` is only needed where the display name would match the wrong mark
// in IconForTech (e.g. "Node.js" contains "js").
const CORE = [
  { title: "React" },
  { title: "Next.js" },
  { title: "TypeScript" },
  { title: "Ruby on Rails" },
  { title: "Ruby" },
  { title: "PostgreSQL" },
  { title: "Redis" },
  { title: "Stripe" },
  { title: "Tailwind CSS" },
  { title: "Node.js", icon: "node" },
];
const TOOLS = [
  { title: "Sidekiq" },
  { title: "Docker" },
  { title: "AWS" },
  { title: "GitHub Actions", icon: "actions" },
  { title: "Heroku" },
  { title: "Jest" },
  { title: "RSpec" },
  { title: "Vite" },
  { title: "Redux" },
  { title: "Material UI", icon: "mui" },
  { title: "JavaScript" },
];
const toLogos = (list, size) => list.map((t) => ({ title: t.title, node: <IconForTech name={t.icon ?? t.title} size={size} colored /> }));

/**
 * The stack as two counter-scrolling logo rails (React Bits LogoLoop): core
 * tools with names, then everyday tooling muted until hovered. Scrolling the
 * page nudges the speed; hovering slows a rail down.
 */
export function Marquee() {
  // Monochrome marks (Next.js, GitHub) are picked per theme at render time.
  const mode = useThemeMode();
  const core = React.useMemo(() => toLogos(CORE, 26), [mode]);
  const tools = React.useMemo(() => toLogos(TOOLS, 22), [mode]);
  return (
    <div className="marquee logo-rails">
      <LogoLoop
        logos={core}
        speed={48}
        hoverSpeed={12}
        logoHeight={26}
        gap={56}
        labels="inline"
        scaleOnHover
        scrollBoost={0.6}
        fadeOutWidth={0.14}
        ariaLabel="Core stack"
        className="logo-rail logo-rail-core"
      />
      <LogoLoop
        logos={tools}
        speed={36}
        direction="right"
        hoverSpeed={10}
        logoHeight={22}
        gap={48}
        labels="inline"
        muted={0.45}
        scaleOnHover
        scrollBoost={0.6}
        fadeOutWidth={0.14}
        ariaLabel="Tooling"
        className="logo-rail logo-rail-tools"
      />
    </div>
  );
}
