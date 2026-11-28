import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { IconForTech } from "../../components/Icons";
import { FLOW_CORE, FLOW_CLUSTERS } from "../../utils/flowchartData";
import { useThemeMode } from "../../hooks/useThemeMode";
import { Reveal, SectionHead } from "../parts";
// Mouse-only and the heaviest part of the section, so touch devices never load it.
const ToolboxOrbit = React.lazy(() => import("./ToolboxOrbit").then((m) => ({ default: m.ToolboxOrbit })));
import { usePointerFine } from "../../hooks/usePointerFine";

const EASE = [0.22, 1, 0.36, 1];

const title = (label) => label.charAt(0) + label.slice(1).toLowerCase();

const GROUPS = [
  { ...FLOW_CORE, label: "Core engine", core: true, blurb: "Everything else plugs into these three." },
  ...["infra", "data", "frontend", "integrations", "payments"].map((id) => {
    const c = FLOW_CLUSTERS.find((x) => x.id === id);
    return { ...c, label: title(c.label) };
  }),
];

const ORBIT_GROUPS = GROUPS.slice(1);

const ALL = GROUPS.flatMap((g) => g.items.map((it) => ({ ...it, group: g.label })));

function Spec({ item, index, total, onStep }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={item.id}
        className="tb-spec-body"
        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
        transition={{ duration: 0.32, ease: EASE }}
      >
        <div className="tb-spec-top">
          <span className="tb-spec-icon">
            <IconForTech name={item.name} size={24} colored={false} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="k">{item.group} · {item.nodeClass}</div>
            <h3 className="display tb-spec-name">{item.name}</h3>
          </div>
        </div>

        <div className="k tb-spec-label">In production</div>
        <p className="tb-spec-role">{item.role}</p>

        <div className="tb-proof">
          <div className="k tb-spec-label" style={{ color: "var(--accent-text)", marginTop: 0 }}>Where it shipped</div>
          <p>{item.deploymentNote}</p>
        </div>

        <div className="tb-spec-foot">
          <span className="mono">{String(index + 1).padStart(2, "0")} / {total}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className="tb-step cursor-target" aria-label="Previous technology" onClick={() => onStep(-1)}>
              <FiArrowLeft size={14} />
            </button>
            <button type="button" className="tb-step cursor-target" aria-label="Next technology" onClick={() => onStep(1)}>
              <FiArrowRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function Toolbox() {
  // Monochrome marks (GitHub, Next.js…) pick black or white at render time.
  useThemeMode();
  const [selectedId, setSelectedId] = useState(ALL[0].id);
  const index = useMemo(() => ALL.findIndex((i) => i.id === selectedId), [selectedId]);
  const item = ALL[index];
  const step = (d) => setSelectedId(ALL[(index + d + ALL.length) % ALL.length].id);
  const spec = <Spec item={item} index={index} total={ALL.length} onStep={step} />;
  // The orbit needs a mouse and room; touch and narrow screens keep the grid.
  const fine = usePointerFine();
  const [view, setView] = useState("orbit");
  const orbit = fine && view === "orbit";

  return (
    <section className="sec" id="skills">
      <div className="wrap">
        <SectionHead
          eyebrow="Toolbox"
          title="My toolkit,"
          accent="in orbit around Rails."
          lead="Pick any piece to see what it actually does in production, and where it shipped."
        />

        {fine && (
          <div className="cc-mode tb-view" role="group" aria-label="Toolbox view">
            {[["orbit", "Orbit"], ["grid", "Grid"]].map(([v, label]) => (
              <button key={v} type="button" aria-pressed={view === v} className={`cc-mode-btn cursor-target${view === v ? " is-on" : ""}`} onClick={() => setView(v)}>
                {view === v && <motion.span layoutId="tb-view-pill" className="cc-mode-pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span style={{ position: "relative" }}>{label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="tb">
          {orbit ? (
            <Reveal className="card tb-orbit-card">
              <React.Suspense fallback={<div className="orbit" style={{ height: 620 }} />}>
                <ToolboxOrbit core={GROUPS[0]} groups={ORBIT_GROUPS} selectedId={selectedId} onSelect={setSelectedId} />
              </React.Suspense>
            </Reveal>
          ) : (
          <div className="tb-groups">
            {GROUPS.map((g, gi) => {
              const open = g.items.some((i) => i.id === selectedId);
              return (
                <Reveal
                  key={g.id}
                  delay={(gi % 2) * 0.06}
                  className={`card tb-group${g.core ? " tb-core" : ""}${open ? " is-open" : ""}`}
                >
                  <div className="tb-group-head">
                    <span className="k">{g.label}</span>
                    <span className="mono tb-count">{String(g.items.length).padStart(2, "0")}</span>
                  </div>
                  {g.blurb && <p className="tb-blurb">{g.blurb}</p>}
                  <div className="tb-chips">
                    {g.items.map((it, ci) => {
                      const on = it.id === selectedId;
                      return (
                        <motion.button
                          key={it.id}
                          type="button"
                          aria-pressed={on}
                          className={`tb-chip cursor-target${on ? " is-on" : ""}`}
                          onClick={() => setSelectedId(it.id)}
                          initial={{ opacity: 0, y: 10, scale: 0.92 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          whileHover={{ y: -2 }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{ duration: 0.45, delay: 0.15 + ci * 0.05, ease: EASE }}
                        >
                          {on && <motion.span layoutId="tb-sel" className="tb-chip-sel" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                          <IconForTech name={it.name} size={g.core ? 17 : 15} colored={false} />
                          <span style={{ position: "relative" }}>{it.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {open && <div className="tb-inline">{spec}</div>}
                </Reveal>
              );
            })}
          </div>
          )}

          <aside className="card tb-spec" aria-live="polite">
            <div className="tb-spec-ring" aria-hidden="true" />
            <div className="tb-spec-glow" />
            {spec}
          </aside>
        </div>
      </div>
    </section>
  );
}
