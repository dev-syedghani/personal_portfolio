import React, { useRef } from "react";
import { motion, useInView, useScroll, useSpring } from "framer-motion";
import resumeData from "../../utils/resumeData";
import SpotlightCard from "../../components/reactbits/SpotlightCard";
import { IconForTech } from "../../components/Icons";
import { Reveal, SectionHead, Tilt } from "../parts";
import CountUp from "../../components/reactbits/CountUp";
import { useSpot } from "./Glance";
import { useThemeMode } from "../../hooks/useThemeMode";
import { FiArrowUpRight, FiCheck, FiCreditCard, FiLayers, FiShield, FiShuffle } from "react-icons/fi";

const PILLAR_ICONS = { architecture: FiLayers, integrations: FiShuffle, payments: FiCreditCard, auth: FiShield };

// Counts up the numeric part of a metric like "40%" or "8 mo"; "0" stays put.
function MetricValue({ value }) {
  const m = /^(\d+)(.*)$/.exec(value);
  if (!m || m[1] === "0") return value;
  return <CountUp to={Number(m[1])} suffix={m[2]} duration={1.6} />;
}

export function Expertise() {
  const SPOT = useSpot();
  return (
    <section className="sec" id="expertise">
      <div className="wrap">
        <SectionHead
          eyebrow="Expertise"
          title="What I'm good at,"
          accent="with receipts."
          lead="Four areas I keep getting trusted with — each one backed by a number from a system that's live today."
        />
        <div className="pillars">
          {resumeData.railsProficiency.map((p, i) => {
            const Icon = PILLAR_ICONS[p.icon] ?? FiLayers;
            return (
              <Reveal key={p.title} delay={(i % 2) * 0.08} style={{ height: "100%" }}>
                <Tilt max={4} glare>
                <SpotlightCard {...SPOT} className="pillar" style={{ ...SPOT.style, padding: 32 }}>
                  <div className="pillar-head">
                    <span className="stat-icon"><Icon size={16} /></span>
                    <span className="k">0{i + 1}</span>
                  </div>
                  <h3 className="display pillar-title">{p.title}</h3>
                  {p.metric && (
                    <div className="pillar-metric">
                      <span className="stat-num accent"><MetricValue value={p.metric.value} /></span>
                      <span className="pillar-metric-label">{p.metric.label}</span>
                    </div>
                  )}
                  <ul className="pillar-points">
                    {p.points.map((pt) => (
                      <li key={pt}>
                        <FiCheck size={14} className="pillar-tick" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  {p.tags?.length > 0 && (
                    <div className="pillar-tags">
                      {p.tags.map((t) => <span key={t} className="mono">{t}</span>)}
                    </div>
                  )}
                </SpotlightCard>
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const SKILL_LABELS = {
  frontend: "Frontend",
  backend: "Backend",
  payments: "Payments",
  integrations: "Auth & integrations",
  testingAndDevOps: "Testing & DevOps",
  railsGems: "Rails gems",
  also: "Everyday tools",
};

// Only the categories the résumé actually defines, and only non-empty ones.
const SKILL_GROUPS = Object.entries(SKILL_LABELS)
  .map(([key, label]) => [label, resumeData.skills[key]])
  .filter(([, items]) => Array.isArray(items) && items.length > 0);

export function Skills() {
  // Monochrome marks (Next.js, GitHub…) pick black or white at render time, so
  // the section re-renders on a theme switch to repaint them.
  useThemeMode();
  return (
    <section className="sec" id="skills">
      <div className="wrap">
        <SectionHead eyebrow="Toolbox" title="The stack" accent="I ship with." />
        <div className="skills">
          {SKILL_GROUPS.map(([label, items], gi) => (
            <Reveal key={label} delay={(gi % 3) * 0.08} className="card" style={{ padding: 28 }}>
              <div className="k" style={{ marginBottom: 18 }}>{label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {items.map((s) => (
                  <span key={s.name} className="skill-chip" title={s.detail?.join(" · ")}>
                    <IconForTech name={s.name} size={15} colored />
                    {s.name}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ it, SPOT }) {
  const ref = useRef(null);
  // Lit once the scroll line would reach it: the fill runs to "end 60%", so
  // a node counts as reached when it passes ~40% from the bottom.
  const lit = useInView(ref, { once: true, margin: "0px 0px -40% 0px" });
  return (
    <Reveal style={{ position: "relative" }}>
      <span ref={ref} className={`timeline-node${lit ? " is-lit" : ""}${it.now ? " is-now" : ""}`} />
      <Tilt max={2.5} glare>
        <SpotlightCard {...SPOT} className="tl-card" style={{ ...SPOT.style, padding: 0 }}>
          <div className="tl-item">
            <div className="tl-meta">
              <div className="mono tl-when">{it.when}</div>
              <div className="tl-where">{it.where}</div>
              {it.now && <span className="now-live tl-now"><span className="live-dot" /> Now</span>}
            </div>
            <div>
              <div className="tl-head">
                <span className={`tl-logo${it.logo ? "" : " is-empty"}`}>
                  {it.logo ? <img src={it.logo} alt="" loading="lazy" /> : it.org.slice(0, 1)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h3 className="display tl-title">{it.title}</h3>
                  {it.url ? (
                    <a href={it.url} target="_blank" rel="noreferrer" className="tl-org cursor-target" data-cursor-label="visit">
                      {it.org} <FiArrowUpRight size={13} />
                    </a>
                  ) : (
                    <div className="tl-org">{it.org}</div>
                  )}
                </div>
              </div>
              {it.highlights?.length > 0 && (
                <div className="tl-stats">
                  {it.highlights.map((h) => (
                    <div key={h.label} className="tl-stat">
                      <span className="display accent"><MetricValue value={h.value} /></span>
                      <span className="tl-stat-label">{h.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {it.body.length > 0 && (
                <ul className="tl-points">
                  {it.body.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SpotlightCard>
      </Tilt>
    </Reveal>
  );
}

export function Experience() {
  const SPOT = useSpot();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  // Walks resumeData generically rather than destructuring fixed positions: an
  // entry may be a single role (role/duration at the top level) or carry a
  // nested `roles[]` for several titles at one employer, and adding or
  // reordering a job must not mean editing this component.
  const items = [
    ...resumeData.experience.flatMap((job) => {
      const base = { org: job.company, where: job.location, logo: job.logo, url: job.companyUrl, highlights: job.highlights };
      const body = job.points?.length ? job.points.slice(0, 3) : job.summary ? [job.summary] : [];
      if (Array.isArray(job.roles) && job.roles.length) {
        return job.roles.map((r, i) => {
          const when = r.duration ?? r.at ?? job.duration;
          return { ...base, when, now: /present/i.test(when), title: r.title ?? r.role, body: i === 0 ? body : r.points?.slice(0, 3) ?? [] };
        });
      }
      return [{ ...base, when: job.duration, now: /present/i.test(job.duration), title: job.role, body }];
    }),
    ...resumeData.education.map((e) => ({
      when: e.duration,
      title: e.degree,
      org: e.institution,
      where: "Education",
      body: [e.coursework?.join(" · ")].filter(Boolean),
    })),
  ];

  return (
    <section className="sec" id="experience">
      <div className="wrap">
        <SectionHead eyebrow="Experience" title="The road so far," accent="role by role." />
        <div className="timeline" ref={ref}>
          <div className="timeline-rail">
            <motion.div className="timeline-fill" style={{ scaleY: fill }} />
          </div>
          {items.map((it, i) => (
            <TimelineItem key={i} it={it} SPOT={SPOT} />
          ))}
        </div>
      </div>
    </section>
  );
}
