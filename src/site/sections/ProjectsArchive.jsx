import React, { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiArrowUpRight, FiCheck, FiDownload, FiGithub, FiMaximize2, FiPackage } from "react-icons/fi";
import { AutoProjectImage } from "../../components/AutoProjectImage";
import { ProjectSheet } from "./ProjectSheet";
import { IconForTech } from "../../components/Icons";
import { useGemStats } from "../../hooks/useGemStats";
import { useThemeMode } from "../../hooks/useThemeMode";
import { SectionHead, Tilt } from "../parts";
import { GALLERY } from "../projects";

const EASE = [0.22, 1, 0.36, 1];

const KINDS = [
  { id: "all", label: "All" },
  { id: "client", label: "Client work" },
  { id: "personal", label: "Personal" },
  { id: "gem", label: "Open source gems" },
];

// Each tag matches any tech entry containing one of its needles, so
// "Ruby on Rails 7.2" and "Rails 7" both count as Rails.
const TECH = [
  { label: "Rails", needles: ["rails"] },
  { label: "React", needles: ["react"] },
  { label: "Shopify", needles: ["shopify"] },
  { label: "Stripe", needles: ["stripe", "paddle", "chargebee"] },
  { label: "Sidekiq", needles: ["sidekiq"] },
  { label: "PostgreSQL", needles: ["postgres"] },
  { label: "Hotwire", needles: ["hotwire", "turbo", "stimulus"] },
  { label: "AWS / Docker", needles: ["aws", "docker", "kamal", "lambda"] },
];

const hasTech = (p, tag) => (p.tech ?? []).some((t) => tag.needles.some((n) => t.toLowerCase().includes(n)));

function Art({ project: p, downloads }) {
  if (p.kind !== "gem") return <AutoProjectImage name={p.name} tech={p.tech} label={p.group} stats={p.highlights} />;
  const main = (p.tech ?? []).find((t) => !/postgres|redis/i.test(t)) ?? p.tech?.[0];
  return (
    <div className="gal-art">
      <div className="gal-art-grid" />
      {main && (
        <span className="gal-art-mark">
          <IconForTech name={main} size={120} colored={false} />
        </span>
      )}
      <div className="gal-art-text">
        <span className="mono">{p.kind === "gem" ? `gem install ${p.name}` : p.group}</span>
        <strong className="display">{p.name}</strong>
        {p.kind === "gem" && downloads != null && (
          <span className="gal-art-stat"><FiDownload size={13} /> {downloads.toLocaleString()} downloads</span>
        )}
      </div>
    </div>
  );
}

function Card({ project: p, downloads, onOpen }) {
  const highlight = p.metrics?.[0];
  return (
    <article className="card gal-card">
      <button type="button" className="gal-media gal-open cursor-target" data-cursor-label="details" onClick={onOpen} aria-label={`Open ${p.name} details`}>
        <motion.div
          className="gal-curtain"
          initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.12 }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          {p.preview ? <img src={p.preview} alt={`${p.name} screenshot`} loading="lazy" /> : <Art project={p} downloads={downloads} />}
        </motion.div>
        <span className="gal-kind mono">{p.kind === "gem" ? `${p.badge} · ${p.version}` : p.badge ?? p.group}</span>
        <span className="gal-expand" aria-hidden="true"><FiMaximize2 size={14} /> Details</span>
      </button>

      <div className="gal-body">
        <h3 className="display gal-title">
          <button type="button" className="gal-title-btn" onClick={onOpen}>{p.name}</button>
        </h3>
        <p className="gal-desc">{p.description}</p>

        {highlight && (
          <p className="gal-highlight">
            <FiCheck size={14} /> <span>{highlight}</span>
          </p>
        )}

        {p.tech?.length > 0 && (
          <div className="gal-tech">
            {p.tech.slice(0, 4).map((t) => <span key={t} className="mono">{t}</span>)}
            {p.tech.length > 4 && <span className="mono">+{p.tech.length - 4}</span>}
          </div>
        )}

        <div className="gal-links">
          <button type="button" className="gal-link gal-link-btn cursor-target" onClick={onOpen}>
            <FiMaximize2 size={13} /> Details
          </button>
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" className="gal-link cursor-target" data-cursor-label="open">
              Live site <FiArrowUpRight size={14} />
            </a>
          )}
          {p.github && (
            <a href={p.github} target="_blank" rel="noreferrer" className="gal-link cursor-target" data-cursor-label="code">
              <FiGithub size={14} /> Code
            </a>
          )}
          {p.rubygems && (
            <a href={p.rubygems} target="_blank" rel="noreferrer" className="gal-link cursor-target" data-cursor-label="gem">
              <FiPackage size={14} /> RubyGems
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProjectsArchive() {
  // Monochrome marks (GitHub, Next.js…) pick black or white at render time.
  useThemeMode();
  const { counts } = useGemStats();
  const [kind, setKind] = useState("all");
  const [tech, setTech] = useState(null);
  const [openIdx, setOpenIdx] = useState(-1);

  const byKind = useMemo(() => (kind === "all" ? GALLERY : GALLERY.filter((p) => p.kind === kind)), [kind]);
  const shown = useMemo(() => (tech ? byKind.filter((p) => hasTech(p, tech)) : byKind), [byKind, tech]);
  // Only offer tech filters that would return something under the current tab.
  const techs = useMemo(() => TECH.filter((t) => byKind.some((p) => hasTech(p, t))), [byKind]);

  const close = useCallback(() => setOpenIdx(-1), []);
  const step = useCallback((d) => setOpenIdx((i) => (i + d + shown.length) % shown.length), [shown.length]);
  const opened = openIdx >= 0 ? shown[openIdx] : null;

  const pickKind = (id) => {
    setKind(id);
    if (tech && !GALLERY.some((p) => (id === "all" || p.kind === id) && hasTech(p, tech))) setTech(null);
  };

  return (
    <main className="sec archive">
      <div className="wrap">
        {/* An anchor, not a button: this is navigation, so it should respect
            middle-click, open-in-new-tab and the browser's own history. */}
        <a href="#top" className="btn btn-ghost cursor-target archive-back" data-cursor-label="back">
          <FiArrowLeft /> Back to the site
        </a>

        <SectionHead
          eyebrow="Archive"
          title={`All ${GALLERY.length} builds,`}
          accent="filter to what you care about."
          lead="Client platforms, personal projects and the Ruby gems I publish. Filter by type or by stack."
        />

        <div className="gal-filters">
          <div className="gal-tabs" role="tablist" aria-label="Project type">
            {KINDS.map((k) => {
              const n = k.id === "all" ? GALLERY.length : GALLERY.filter((p) => p.kind === k.id).length;
              const on = kind === k.id;
              return (
                <button key={k.id} type="button" role="tab" aria-selected={on} className={`gal-tab cursor-target${on ? " is-on" : ""}`} onClick={() => pickKind(k.id)}>
                  {on && <motion.span layoutId="gal-tab-pill" className="gal-tab-pill" transition={{ duration: 0.4, ease: EASE }} />}
                  <span className="gal-tab-label">{k.label}</span>
                  <span className="gal-tab-n mono">{n}</span>
                </button>
              );
            })}
          </div>

          <div className="gal-techs" aria-label="Filter by stack">
            <span className="k">Stack</span>
            {techs.map((t) => {
              const on = tech?.label === t.label;
              return (
                <button key={t.label} type="button" aria-pressed={on} className={`tb-chip cursor-target${on ? " is-on" : ""}`} onClick={() => setTech(on ? null : t)}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="gal-status mono" aria-live="polite">
          Showing {shown.length} of {GALLERY.length}
          {tech && (
            <button type="button" className="gal-clear cursor-target" onClick={() => setTech(null)}>
              clear stack filter
            </button>
          )}
        </div>

        <motion.div layout className="gal-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => (
              <motion.div
                key={`${p.kind}-${p.name}`}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Tilt max={6} scale={1.015} glare>
                  <Card project={p} downloads={counts[p.name]} onOpen={() => setOpenIdx(i)} />
                </Tilt>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Portalled to the site root: <main> is its own stacking context
          (z-index: 1), which would trap the sheet under the top bar. */}
      {createPortal(
      <AnimatePresence>
        {opened && (
          <ProjectSheet
            key="sheet"
            project={opened}
            index={openIdx}
            total={shown.length}
            downloads={counts[opened.name]}
            onClose={close}
            onStep={step}
          />
        )}
      </AnimatePresence>,
        document.querySelector(".site") ?? document.body,
      )}
    </main>
  );
}
