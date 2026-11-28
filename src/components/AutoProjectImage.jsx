import React from "react";
import { IconForTech } from "./Icons";

/**
 * On-brand stand-in for a project with no honest screenshot (styled by .gal-art
 * in site.css). With `stats`, it becomes a small dashboard of the project's
 * headline numbers, so a missing screenshot still says something real.
 */
export function AutoProjectImage({ name, tech, label, stats }) {
  const main = (tech ?? []).find((t) => !/postgres|redis/i.test(t)) ?? tech?.[0];
  const shown = (stats ?? []).slice(0, 4);
  return (
    <div className={`gal-art${shown.length ? " has-stats" : ""}`}>
      <div className="gal-art-grid" />
      {main && (
        <span className="gal-art-mark">
          <IconForTech name={main} size={120} colored={false} />
        </span>
      )}
      <div className="gal-art-text">
        {label && <span className="mono">{label}</span>}
        <strong className="display">{name}</strong>
      </div>
      {shown.length > 0 && (
        <div className="gal-art-stats">
          {shown.map((s) => (
            <div key={s.label}>
              <b className="display">{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
