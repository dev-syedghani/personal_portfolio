import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Tilt } from "../parts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const EASE = [0.22, 1, 0.36, 1];

// Component-wise, not new Date(iso): that parses as UTC midnight and reads back
// in local time, landing every date a day early for anyone west of UTC.
function parseDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const fmt = (d) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });

/**
 * Builds week columns padded to the first day's real weekday — chunking the
 * days into sevens blindly would shear every row off its true day.
 */
function useCalendar(contributions) {
  return useMemo(() => {
    const days = contributions.map((c) => ({ ...c, d: parseDay(c.date) }));
    const lead = days.length ? days[0].d.getDay() : 0;
    const cells = [...Array(lead).fill(null), ...days];
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    const months = [];
    weeks.forEach((w, col) => {
      const first = w.find((c) => c && c.d.getDate() <= 7);
      if (first && (!months.length || months[months.length - 1].m !== first.d.getMonth())) {
        months.push({ m: first.d.getMonth(), col });
      }
    });

    const perMonth = new Map();
    const perWeekday = Array(7).fill(0);
    let active = 0;
    let sum = 0;
    for (const c of days) {
      const key = `${c.d.getFullYear()}-${c.d.getMonth()}`;
      const slot = perMonth.get(key) ?? { m: c.d.getMonth(), y: c.d.getFullYear(), count: 0 };
      slot.count += c.count;
      perMonth.set(key, slot);
      perWeekday[c.d.getDay()] += c.count;
      sum += c.count;
      if (c.count > 0) active += 1;
    }
    const monthly = [...perMonth.values()];
    const busiestMonth = monthly.reduce((a, b) => (b.count > (a?.count ?? -1) ? b : a), null);
    const busiestDay = perWeekday.indexOf(Math.max(...perWeekday));
    return {
      weeks,
      months,
      monthly,
      busiestMonth,
      busiestDay: sum ? WEEKDAYS[busiestDay] : "—",
      avg: active ? (sum / active).toFixed(1) : "0",
      lastDate: days[days.length - 1]?.date,
    };
  }, [contributions]);
}

export function ContributionCalendar({ contributions }) {
  const cal = useCalendar(contributions);
  const wrapRef = useRef(null);
  const boardRef = useRef(null);
  const inView = useInView(boardRef, { once: true, amount: 0.25 });
  const [hover, setHover] = useState(null);
  const [is3d, setIs3d] = useState(true);
  const scrollRef = useRef(null);
  // On a phone the board scrolls sideways; open it on the most recent weeks,
  // which are the interesting end, rather than last year's empty ones.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
  }, [contributions]);

  const maxMonth = Math.max(1, ...cal.monthly.map((m) => m.count));

  const onCell = (e, c, col, row) => {
    const wrap = wrapRef.current.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ c, col, row, x: r.left - wrap.left + r.width / 2, y: r.top - wrap.top });
  };

  // Cursor spotlight + magnetic lift, written straight to CSS vars so a
  // mousemove never re-renders 370 cells. Centres are cached on entry; the
  // board's tilt moves them a few pixels at most, well inside RADIUS.
  const centres = useRef([]);
  const lifted = useRef([]);
  const cache = () => {
    centres.current = [...boardRef.current.querySelectorAll(".cc-grid .cc-cell")].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  };
  const RADIUS = 70;
  const onMove = (e) => {
    const r = boardRef.current.getBoundingClientRect();
    boardRef.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    boardRef.current.style.setProperty("--my", `${e.clientY - r.top}px`);
    if (!centres.current.length) cache();
    lifted.current.forEach((el) => el.style.removeProperty("--lift"));
    lifted.current = [];
    for (const c of centres.current) {
      const d = Math.hypot(c.x - e.clientX, c.y - e.clientY);
      if (d < RADIUS) {
        c.el.style.setProperty("--lift", (1 - d / RADIUS) ** 2);
        lifted.current.push(c.el);
      }
    }
  };
  const onLeave = () => {
    lifted.current.forEach((el) => el.style.removeProperty("--lift"));
    lifted.current = [];
    centres.current = [];
    setHover(null);
  };

  return (
    <div className="cc" ref={wrapRef}>
      <Tilt max={4} className="cc-tilt" style={{ height: "auto" }}>
      <div className="cc-scroll" ref={scrollRef}>
        <div
          ref={boardRef}
          className={`cc-board${inView ? " is-in" : ""}${hover ? " is-hovering" : ""}${is3d ? " is-3d" : ""}`}
          style={{ "--weeks": cal.weeks.length }}
          onMouseEnter={cache}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <div className="cc-spot" aria-hidden="true" />
          <div className="cc-months" aria-hidden="true">
            {cal.months.map(({ m, col }) => (
              <span key={`${m}-${col}`} style={{ gridColumn: col + 1 }}>{MONTHS[m]}</span>
            ))}
          </div>
          <div className="cc-days mono" aria-hidden="true">
            <span style={{ gridRow: 2 }}>Mon</span>
            <span style={{ gridRow: 4 }}>Wed</span>
            <span style={{ gridRow: 6 }}>Fri</span>
          </div>
          <div className="cc-grid" role="grid" aria-label="Contribution calendar">
            {cal.weeks.map((w, col) =>
              w.map((c, row) =>
                c ? (
                  <span
                    key={c.date}
                    role="gridcell"
                    aria-label={`${c.count} contributions on ${fmt(c.d)}`}
                    className={[
                      "cc-cell",
                      `l${c.level}`,
                      hover && (hover.col === col || hover.row === row) ? "is-cross" : "",
                      hover?.c === c ? "is-hot" : "",
                      c.date === cal.lastDate ? "is-today" : "",
                    ].join(" ")}
                    style={{ gridColumn: col + 1, gridRow: row + 1, "--d": `${col * 14 + row * 22}ms` }}
                    onMouseEnter={(e) => onCell(e, c, col, row)}
                  />
                ) : (
                  <span key={`pad-${row}`} style={{ gridColumn: col + 1, gridRow: row + 1 }} />
                ),
              ),
            )}
            {/* In 3D the month names lie on the board, below the tiles. */}
            {cal.months.map(({ m, col }) => (
              <span key={`floor-${m}-${col}`} className="cc-floor-month mono" aria-hidden="true" style={{ gridColumn: `${col + 1} / span 4`, gridRow: 8 }}>
                {MONTHS[m]}
              </span>
            ))}
          </div>
        </div>
      </div>

      </Tilt>

      {hover && (
        <div className="cc-tip" style={{ left: hover.x, top: hover.y }}>
          <strong>{hover.c.count === 0 ? "No" : hover.c.count} contribution{hover.c.count === 1 ? "" : "s"}</strong>
          <span>{fmt(hover.c.d)}</span>
        </div>
      )}

      <div className="cc-foot">
        <div className="cc-mode" role="group" aria-label="Calendar view">
          {[["3D", true], ["Flat", false]].map(([label, v]) => (
            <button key={label} type="button" aria-pressed={is3d === v} className={`cc-mode-btn cursor-target${is3d === v ? " is-on" : ""}`} onClick={() => { onLeave(); setIs3d(v); }}>
              {is3d === v && <motion.span layoutId="cc-mode-pill" className="cc-mode-pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span style={{ position: "relative" }}>{label}</span>
            </button>
          ))}
        </div>
        <div className="cc-legend mono" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((l) => <span key={l} className={`cc-cell l${l}`} />)}
          More
        </div>
      </div>

      <div className="cc-lower">
        <div className="cc-bars" aria-label="Contributions per month">
          {cal.monthly.map((m, i) => {
            const top = cal.busiestMonth && m === cal.busiestMonth;
            return (
              <div key={`${m.y}-${m.m}`} className={`cc-bar${top ? " is-top" : ""}`} title={`${MONTHS[m.m]} ${m.y}: ${m.count}`}>
                <span className="cc-bar-n mono">{m.count}</span>
                <div className="cc-bar-track">
                  <motion.div
                    className="cc-bar-fill"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: inView ? Math.max(0.02, m.count / maxMonth) : 0 }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.05, ease: EASE }}
                  />
                </div>
                <span className="cc-bar-m mono">{MONTHS[m.m].slice(0, 1)}</span>
              </div>
            );
          })}
        </div>

        <div className="cc-insights">
          {[
            ["Busiest month", cal.busiestMonth?.count ? `${MONTHS[cal.busiestMonth.m]} ${cal.busiestMonth.y}` : "—"],
            ["Busiest weekday", cal.busiestDay],
            ["Avg per active day", cal.avg],
          ].map(([k, v]) => (
            <div key={k} className="cc-insight">
              <span className="k">{k}</span>
              <span className="display">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
