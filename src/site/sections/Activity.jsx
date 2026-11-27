import React, { useMemo, useState } from "react";
import { FiGithub } from "react-icons/fi";
import { useGitHubContributions, useContributionYears } from "../../hooks/useGitHubContributions";
import { ContributionHeatmap } from "../../components/sections/GitHubSection";
import CountUp from "../../components/reactbits/CountUp";
import { Reveal, SectionHead } from "../parts";

const USER = "dev-syedghani";

function summarize(days) {
  if (!days?.length) return { active: 0, best: null, streak: 0 };
  let active = 0;
  let best = null;
  let streak = 0;
  let run = 0;
  for (const d of days) {
    if (d.count > 0) {
      active += 1;
      run += 1;
      streak = Math.max(streak, run);
      if (!best || d.count > best.count) best = d;
    } else {
      run = 0;
    }
  }
  return { active, best, streak };
}

export function Activity() {
  const [year, setYear] = useState("last");
  const { data, loading, error } = useGitHubContributions(year);
  // Years come from the snapshot, so this list tracks the account on its own.
  const years = useContributionYears();

  const days = data?.contributions ?? [];
  const total = data?.total ? Object.values(data.total).reduce((a, b) => a + b, 0) : 0;
  const { active, best, streak } = useMemo(() => summarize(days), [days]);

  const stats = [
    { label: "contributions", value: total },
    { label: "active days", value: active },
    { label: "day streak (best)", value: streak },
    { label: "commits on best day", value: best?.count ?? 0 },
  ];

  return (
    <section className="sec" id="github">
      <div className="wrap">
        <SectionHead eyebrow="Activity" title="Commit" accent="history." lead="Pulled live from GitHub. Hover a pillar to see a day." />

        <Reveal>
          <div className="card" style={{ padding: "clamp(18px,3vw,32px)", background: "var(--card)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <a href={`https://github.com/${USER}`} target="_blank" rel="noreferrer" className="cursor-target mono" data-cursor-label="github" style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--ink)", textDecoration: "none", fontSize: 14 }}>
                <FiGithub size={18} /> @{USER}
              </a>
              <div
                className="gh-years"
                role="group"
                aria-label="Contribution year"
                style={{ "--gh-year-hover": "var(--card-hover)", "--gh-year-active-bg": "var(--accent)", "--gh-year-active-fg": "var(--accent-ink)", color: "var(--muted)" }}
              >
                {["last", ...years].map((y) => (
                  <button key={y} type="button" className="gh-year" aria-current={year === y} onClick={() => setYear(y)}>
                    {y === "last" ? "Last 12 months" : y}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 18 }}>
              {stats.map((s) => (
                <div key={s.label} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid var(--line)", background: "rgba(255,255,255,0.015)" }}>
                  <div className="display" style={{ fontSize: 28, color: "var(--ink)" }}>
                    {loading ? "—" : <CountUp key={`${year}-${s.label}-${s.value}`} to={s.value} suffix={s.suffix ?? ""} duration={1.4} />}
                  </div>
                  <div className="k" style={{ marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {loading && <div className="mono" style={{ minHeight: 264, display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 12 }}>Loading contributions…</div>}
            {error && !loading && <div className="mono" style={{ minHeight: 264, display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 12 }}>GitHub is not responding right now. Try again in a moment.</div>}
            {!loading && !error && days.length > 0 && <ContributionHeatmap key={year} contributions={days} totalThisYear={total} year={year} />}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
