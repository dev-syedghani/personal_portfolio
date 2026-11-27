import React, { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import resumeData from "../../utils/resumeData";
import SpotlightCard from "../../components/reactbits/SpotlightCard";
import { IconForTech } from "../../components/Icons";
import { Reveal, SectionHead } from "../parts";
import { useSpot } from "./Glance";
import { useThemeMode } from "../../hooks/useThemeMode";

export function Expertise() {
  const SPOT = useSpot();
  return (
    <section className="sec" id="expertise">
      <div className="wrap">
        <SectionHead
          eyebrow="Expertise"
          title="Not a checklist,"
          accent="proof in production."
          lead="Concrete outcomes across architecture, payments, data and auth, measured on real traffic."
        />
        <div className="pillars">
          {resumeData.railsProficiency.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.08} style={{ height: "100%" }}>
              <SpotlightCard {...SPOT} style={{ ...SPOT.style, padding: 32 }}>
                <span className="k">0{i + 1}</span>
                <h3 className="display" style={{ fontSize: 24, margin: "14px 0 20px" }}>{p.title}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 11 }}>
                  {p.points.map((pt) => (
                    <li key={pt} style={{ display: "flex", gap: 12, color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6 }}>
                      <span style={{ flexShrink: 0, width: 4, height: 4, borderRadius: "50%", background: "var(--dim)", marginTop: 10 }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </Reveal>
          ))}
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

export function Experience() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  // Walks resumeData generically rather than destructuring fixed positions: an
  // entry may be a single role (role/duration at the top level) or carry a
  // nested `roles[]` for several titles at one employer, and adding or
  // reordering a job must not mean editing this component.
  const items = [
    ...resumeData.experience.flatMap((job) => {
      const base = { org: job.company, where: job.location };
      const body = job.points?.length ? job.points.slice(0, 3) : job.summary ? [job.summary] : [];
      if (Array.isArray(job.roles) && job.roles.length) {
        return job.roles.map((r, i) => ({
          ...base,
          when: r.duration ?? r.at ?? job.duration,
          title: r.title ?? r.role,
          body: i === 0 ? body : r.points?.slice(0, 3) ?? [],
        }));
      }
      return [{ ...base, when: job.duration, title: job.role, body }];
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
        <SectionHead eyebrow="Experience" title="Where I've" accent="been shipping." />
        <div className="timeline" ref={ref}>
          <div className="timeline-rail">
            <motion.div className="timeline-fill" style={{ scaleY: fill }} />
          </div>
          {items.map((it, i) => (
            <Reveal key={i} style={{ position: "relative" }}>
              <span className="timeline-node" />
              <div className="tl-item">
                <div>
                  <div className="mono" style={{ color: "var(--soft)", fontSize: 12.5 }}>{it.when}</div>
                  <div style={{ color: "var(--dim)", fontSize: 12.5, marginTop: 6 }}>{it.where}</div>
                </div>
                <div>
                  <h3 className="display" style={{ fontSize: 22, margin: 0 }}>{it.title}</h3>
                  <div style={{ color: "var(--muted)", fontSize: 14.5, margin: "4px 0 14px" }}>{it.org}</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                    {it.body.map((b, bi) => (
                      <li key={bi} style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.65 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
