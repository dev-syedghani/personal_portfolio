import React from "react";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import SpotlightCard from "../../components/reactbits/SpotlightCard";
import { Reveal, SectionHead } from "../parts";
import { GROUPS, ALL_PROJECTS } from "../projects";

/**
 * The full project archive — every build, grouped by employer, with personal
 * work last. Reached from the Work section's "Show all" link.
 *
 * Rendered as its own page rather than an expanding list: at fourteen entries
 * the home page section stops being scannable, and a distinct URL means the
 * archive can be linked to directly.
 *
 * Client entries carry `problem`/`metrics`, personal entries carry
 * `badge`/`image`, and neither is guaranteed — every optional field is guarded.
 */
function Card({ project: p }) {
  const body = p.problem || p.description;
  return (
    <SpotlightCard className="archive-card" spotlightColor="rgba(52, 211, 153, 0.12)">
      <div className="archive-card-head">
        <h3 className="display archive-card-title">{p.name}</h3>
        {p.badge && <span className="chip archive-badge">{p.badge}</span>}
      </div>

      {body && <p className="archive-card-body">{body}</p>}

      {p.metrics?.length > 0 && (
        <ul className="archive-metrics">
          {p.metrics.slice(0, 3).map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}

      {p.tech?.length > 0 && (
        <div className="archive-tech">
          {p.tech.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      )}

      {p.url && (
        <a
          href={p.url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost cursor-target archive-link"
          data-cursor-label="open"
        >
          Visit <FiArrowUpRight />
        </a>
      )}
    </SpotlightCard>
  );
}

export function ProjectsArchive() {
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
          title={`All ${ALL_PROJECTS.length} projects,`}
          accent="newest employer first."
          lead="Client platforms grouped by where they were built, then personal and open-source work."
        />

        {GROUPS.map((g, gi) => (
          <section key={g.group} className="archive-group">
            <div className="work-group">
              <span className="k">{g.group}</span>
              <span className="work-group-rule" aria-hidden="true" />
              <span className="k archive-count">{g.items.length}</span>
            </div>
            <div className="archive-grid">
              {g.items.map((p, i) => (
                <Reveal key={`${g.group}-${p.name}`} delay={Math.min(i, 4) * 0.05 + gi * 0.02}>
                  <Card project={p} />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
