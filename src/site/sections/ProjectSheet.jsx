import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiDownload, FiGithub, FiPackage, FiX } from "react-icons/fi";
import { IconForTech } from "../../components/Icons";
import { AutoProjectImage } from "../../components/AutoProjectImage";
import CountUp from "../../components/reactbits/CountUp";
import { lockScroll } from "../smoothScroll";

const EASE = [0.22, 1, 0.36, 1];

// Counts up the leading number of a stat like "148", "71.6k", "2,500+" or
// "<200ms"; anything it can't parse cleanly is shown as written.
function StatValue({ value }) {
  const m = /^([^\d]*)([\d,]+)(.*)$/.exec(value);
  if (!m || m[2] === "0" || m[3].startsWith(".")) return value;
  const n = Number(m[2].replace(/,/g, ""));
  return <CountUp to={n} prefix={m[1]} suffix={m[3]} separator={m[2].includes(",") ? "," : ""} duration={1.4} />;
}

/**
 * Full-screen dashboard for one project: headline stats, the problem, every
 * result, the stack and links. Esc closes; ←/→ step through the list.
 */
export function ProjectSheet({ project: p, index, total, downloads, onClose, onStep }) {
  useEffect(() => {
    lockScroll(true);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [onClose, onStep]);

  const stats =
    p.kind === "gem"
      ? [
          ...(downloads != null ? [{ value: downloads.toLocaleString(), label: "downloads on RubyGems" }] : []),
          { value: p.version, label: "latest version" },
        ]
      : p.highlights ?? [];

  return (
    <motion.div
      className="ps-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="ps-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${p.name} details`}
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <motion.div key={p.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
          <header className="ps-head">
            <div className="ps-head-top">
              <div className="ps-tags">
                <span className="chip ps-tag">{p.kind === "gem" ? "Ruby gem" : p.group}</span>
                {p.role && <span className="chip ps-tag is-accent">{p.role}</span>}
                {p.period && <span className="mono ps-period">{p.period}</span>}
              </div>
              <button type="button" className="ps-close cursor-target" aria-label="Close" onClick={onClose}>
                <FiX size={18} />
              </button>
            </div>
            <h2 className="display ps-title">{p.name}</h2>
            <p className="ps-desc">{p.description}</p>
            <div className="ps-links">
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className="btn btn-primary cursor-target" data-cursor-label="open">
                  Visit live site <FiArrowUpRight size={15} />
                </a>
              )}
              {p.github && (
                <a href={p.github} target="_blank" rel="noreferrer" className="btn btn-ghost cursor-target" data-cursor-label="code">
                  <FiGithub size={15} /> Source code
                </a>
              )}
              {p.rubygems && (
                <a href={p.rubygems} target="_blank" rel="noreferrer" className="btn btn-ghost cursor-target" data-cursor-label="gem">
                  <FiPackage size={15} /> RubyGems
                </a>
              )}
            </div>
          </header>

          {stats.length > 0 && (
            <div className="ps-stats" style={{ "--n": Math.min(stats.length, 6) }}>
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="ps-stat"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.06, ease: EASE }}
                >
                  <span className="display ps-stat-n">
                    {s.label.startsWith("downloads") && <FiDownload size={18} style={{ marginRight: 6 }} />}
                    <StatValue value={s.value} />
                  </span>
                  <span className="ps-stat-l">{s.label}</span>
                </motion.div>
              ))}
            </div>
          )}

          <div className="ps-body">
            <div className="ps-main">
              {p.problem && (
                <section className="ps-box">
                  <div className="k">The problem</div>
                  <p>{p.problem}</p>
                </section>
              )}
              {p.metrics?.length > 0 && (
                <section>
                  <div className="k ps-sub">What I built · {p.metrics.length} results</div>
                  <ol className="ps-results">
                    {p.metrics.map((m, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 + i * 0.05, ease: EASE }}
                      >
                        <b className="mono">{String(i + 1).padStart(2, "0")}</b>
                        <span>{m}</span>
                      </motion.li>
                    ))}
                  </ol>
                </section>
              )}
              {!p.metrics?.length && p.kind !== "client" && (
                <section className="ps-box">
                  <div className="k">About this build</div>
                  <p>{p.description}</p>
                </section>
              )}
            </div>

            <aside className="ps-side">
              <div className="ps-shot">
                {p.preview ? (
                  <img src={p.preview} alt={`${p.name} screenshot`} />
                ) : (
                  <AutoProjectImage name={p.name} tech={p.tech} label={p.kind === "gem" ? `gem install ${p.name}` : p.group} />
                )}
              </div>
              {p.tech?.length > 0 && (
                <section>
                  <div className="k ps-sub">Stack</div>
                  <div className="ps-tech">
                    {p.tech.map((t) => (
                      <span key={t} className="tb-chip">
                        <IconForTech name={t} size={14} colored={false} />
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </motion.div>

        <footer className="ps-foot">
          <button type="button" className="btn btn-ghost cursor-target" onClick={() => onStep(-1)}>
            <FiArrowLeft size={15} /> Previous
          </button>
          <span className="mono">{String(index + 1).padStart(2, "0")} / {total}</span>
          <button type="button" className="btn btn-ghost cursor-target" onClick={() => onStep(1)}>
            Next <FiArrowRight size={15} />
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
}
