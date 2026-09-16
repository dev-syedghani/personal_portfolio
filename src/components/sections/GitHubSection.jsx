import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import C from "../../theme";
import { FadeUp, Section } from "../UI";
import { useGitHubContributions } from "../../hooks/useGitHubContributions";
import { useLeetCodeStats } from "../../hooks/useLeetCodeStats";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useThemeMode } from "../../hooks/useThemeMode";

const GITHUB_USERNAME = "dev-syedghani";
const LEETCODE_USERNAME = "syedghani";

// Oldest year worth offering — GitHub's own profile sidebar stops here, because
// there is no contribution data before the account existed.
const GITHUB_JOINED_YEAR = 2022;

// Authentic GitHub palettes — the real ones GitHub itself ships for each theme.
// Kept as hex literals (not CSS vars) because the cells derive borders and glows
// by appending alpha, e.g. `${color}99`, which needs a real hex string.
const GH = {
  dark: {
    panel: "#0d1117",
    line: "#21262d",
    muted: "#8b949e",
    link: "#58a6ff",
    levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    // Empty days sit one step brighter than GitHub's own #161b22 so the grid still
    // reads as a grid against the near-black panel behind it, instead of the two
    // dissolving into each other.
    empty: "#1e2530",
    label: "#c9d1d9",
    yearHover: "#21262d",
    yearActiveBg: "#1f6feb",
    yearActiveFg: "#ffffff",
  },
  light: {
    panel: "#FFFFFF",
    line: "#D8D2CA",
    muted: "#57606A",
    link: "#0969DA",
    levels: ["#EBEDF0", "#ACEEBB", "#4AC26B", "#2DA44E", "#116329"],
    empty: "#E3E7EB",
    label: "#3D444D",
    yearHover: "#EFF2F5",
    yearActiveBg: "#0969DA",
    yearActiveFg: "#ffffff",
  },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Real GitHub stats — stars, total commits, PRs, issues, contribution grade,
// current/longest streak, top languages — that the contribution calendar
// above doesn't surface on its own. These come from anuraghazra/github-readme-stats
// and github-readme-streak-stats, widely-used public services that query the
// real GitHub API server-side for the given username and render an SVG; no
// token/backend needed on a static GitHub Pages deploy, and no number here
// is invented — it's whatever those services report live.
//
// The official github-readme-stats.vercel.app instance is presently returning
// "DEPLOYMENT_PAUSED" (503) — a known, long-running issue with that free-tier
// host, not specific to this username. `srcs` is an ordered fallback chain:
// each card tries the official host first (most trustworthy long-term), then
// a working community mirror, and only shows "unavailable" if every source
// in the chain fails — matching the same primary→fallback→graceful-empty
// pattern already used for LeetCode stats above.
// These SVGs are drawn by the remote service at a fixed native size (~495×195
// for the stats/streak cards) — an <img> at width:100% inside a flex panel
// that's allowed to *grow* stretches the whole SVG, text and all, to fill
// whatever width the row happens to have. Capping max-width near the native
// size (and never letting the parent flex-grow past its basis) keeps these
// compact and dense like the real github.com widgets, not blown up 3x.
function GitHubStatCard({ srcs, alt, maxWidth = 400 }) {
  const [attempt, setAttempt] = useState(0);
  if (attempt >= srcs.length) {
    return (
      <div style={{ maxWidth, minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", padding: 16 }}>
        {alt} unavailable — GitHub stats service unreachable.
      </div>
    );
  }
  return (
    <img
      key={attempt}
      src={srcs[attempt]}
      alt={alt}
      loading="lazy"
      style={{ display: "block", width: "100%", maxWidth, height: "auto", margin: "0 auto" }}
      onError={() => setAttempt((a) => a + 1)}
    />
  );
}

function GitHubStatsCards({ username }) {
  // Custom hex params (not a preset `theme=`) so the cards match the site's
  // own indigo/teal glass palette exactly instead of a canned GitHub theme.
  const common = "hide_border=true&bg_color=00000000&title_color=8B8CFF&text_color=A8AFBA&icon_color=63D7CA";
  const statsUrls = [
    `https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&${common}&count_private=true`,
    `https://github-readme-stats-eight-theta.vercel.app/api?username=${username}&show_icons=true&${common}&count_private=true`,
  ];
  const streakUrls = [
    `https://github-readme-streak-stats.herokuapp.com/?user=${username}&hide_border=true&background=00000000&stroke=252A32&ring=8B8CFF&fire=63D7CA&currStreakNum=F5F7FA&sideNums=A8AFBA&currStreakLabel=8B8CFF&sideLabels=A8AFBA&dates=686F7A`,
  ];
  const langsUrls = [
    `https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&langs_count=8&${common}`,
    `https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=${username}&layout=compact&langs_count=8&${common}`,
  ];

  // A fragment, not a wrapping div — these three cards need to sit as direct
  // siblings of the LeetCode card in the caller's own flex-wrap row (one flat
  // row that wraps as a whole), not as a single nested flex item that the
  // outer row can't size or wrap around correctly.
  return (
    <>
      <div className="glass" style={{ borderRadius: 16, padding: 16, flex: "0 1 380px", overflow: "hidden", display: "flex", justifyContent: "center" }}>
        <GitHubStatCard srcs={statsUrls} alt="GitHub stats" maxWidth={360} />
      </div>
      <div className="glass" style={{ borderRadius: 16, padding: 16, flex: "0 1 380px", overflow: "hidden", display: "flex", justifyContent: "center" }}>
        <GitHubStatCard srcs={streakUrls} alt="GitHub streak stats" maxWidth={360} />
      </div>
      <div className="glass" style={{ borderRadius: 16, padding: 16, flex: "0 1 300px", overflow: "hidden", display: "flex", justifyContent: "center" }}>
        <GitHubStatCard srcs={langsUrls} alt="Most used languages" maxWidth={280} />
      </div>
    </>
  );
}

// Lighten (positive) or darken (negative) a #rrggbb by a flat step per channel.
// Used to derive a tile's lit top edge and shaded lower edges from its one level
// colour, so the cap reads as a surface catching a light from above rather than a
// flat swatch — and so the whole set stays keyed to GitHub's palette.
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// `new Date("2024-01-01")` is parsed as UTC midnight but read back in local time, so
// west-of-UTC visitors see every date land on the previous day — which shifts the
// weekday the grid pads to and slides the month labels a column left.
function parseDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// LeetCode's brand colors are tuned for their dark UI and wash out on off-white,
// so light mode uses darkened equivalents that still read as the same hues.
const LC = {
  dark: { easy: "#00b8a3", medium: "#ffc01e", hard: "#ef4743" },
  light: { easy: "#00706B", medium: "#8A5A00", hard: "#C0322E" },
};

// A long lens, deliberately. Perspective is measured from the board's centre, so a
// short one (550px against a ~1000px board) fans rising tiles sideways away from
// that centre — January got shoved past the left edge of the scroll container and
// clipped, while the matching spread on the right inflated scrollWidth by ~140px of
// empty space. At this distance the divide is ~2.5% instead of ~9%, so tiles rise
// almost straight up over their own square. Height is what carries the effect here,
// not the fanning, and vertical lift is barely affected: MAX_Z absorbs the rest.
const PERSPECTIVE = 2200;

// Residual spread still has to land somewhere reachable — without a padding box to
// grow into, even a few pixels of leftward push get clipped rather than scrolled to.
const SIDE_PAD = 20;

// Pitch, lowered from 38°. A steeper pitch stacks each week directly behind the
// one in front of it, so a tall pillar hides everything upstream of it; flattening
// toward a standard isometric angle spreads the rows apart on screen instead.
const TILT = 30;

// A small yaw alongside the pitch. With pitch alone the rise axis is exactly
// vertical on screen, so a tall tile occludes its own column precisely; a few
// degrees of rotation offsets that axis diagonally and background tiles stay
// visible past the foreground ones. Kept small — the calendar still has to read
// left-to-right as weeks, so this is a nudge, not a true isometric rotation.
const YAW = -7;

// The day-of-week gutter ("Mon"/"Wed"/"Fri" at 9px mono) plus its margin.
const DAY_GUTTER = 30;

// What a rendered board occupies vertically. Reserved by the loading and error
// states too, so the panel keeps one height from first paint onwards.
const BOARD_MIN_H = 200;

// Cells are sized to fill whatever width the panel has rather than pinned at
// GitHub's 12px, so a year always spans the panel exactly and never needs to be
// scrolled sideways. Bounded at both ends: below the floor a year is unreadable
// confetti (and a phone genuinely can't fit 53 weeks, so there it scrolls after
// all), above the ceiling the board stops looking like a contribution graph —
// lowered from 26 now that the panel sits beside LeetCode instead of spanning
// the full section width, where a 26px ceiling produced an oversized board.
const MIN_CELL = 9;
const MAX_CELL = 15;
const BASE_CELL = 12;

// Everything about the 3D was tuned against a 12px cell, so the whole geometry is
// expressed as ratios of the cell and rescales with it — otherwise a 22px board
// would keep 12px-board heights and read as flat.
function boardMetrics(cell) {
  const CELL = Math.round(cell);
  // Widened from 0.25. The gap is the gutter between pillar *bases*: too tight and
  // neighbouring bases bleed into each other once they have height and side walls.
  const GAP = Math.max(3, Math.round(CELL * 0.42));
  // How far the busiest day floats, and the floor for a day with any commits at
  // all — a single commit still has to visibly lift off the plane. Capped, because
  // an uncapped top tier produced giant pillars that masked whole weeks behind
  // them; the ceiling costs a little dynamic range and buys back readability.
  const MAX_Z = Math.min(Math.round(CELL * 3.6), 52);
  const MIN_Z = Math.round(CELL * 0.55);
  // A tile at MAX_Z climbs ~0.58 × its z in screen pixels once the board is tilted
  // back — z · sin(30°), plus a little from the perspective divide. The grid is
  // pushed down by that much plus the tile's own height, so the busiest days have
  // somewhere to rise into instead of landing on the labels.
  const HEADROOM = Math.ceil(MAX_Z * 0.58) + Math.round(CELL * 2.2);
  // Tilting the board doesn't change what it reserves in layout, only what it
  // covers on screen — so the untilted height stays booked and cos(38°) of it goes
  // unused, leaving ~70px of empty panel under the last row. Pulled back with a
  // matching negative margin. Tiles only ever rise, so nothing risks being cropped.
  const layoutH = HEADROOM + 16 + 7 * CELL + 6 * GAP;
  const FORESHORTEN = Math.round(layoutH * (1 - Math.cos((TILT * Math.PI) / 180)));
  return { CELL, GAP, MAX_Z, MIN_Z, HEADROOM, FORESHORTEN };
}

// Solves the column pitch back into a cell size: a column costs CELL + GAP, and
// GAP is 0.42 of CELL, so CELL is 1/1.42 of the pitch. This ratio has to track the
// one in boardMetrics — widening the gap there without widening it here would size
// cells for the old pitch and overflow the panel by the difference. Floored so
// rounding can only ever make the board narrower than the space it has, never
// wider. `contentWidth` is the board container's content box — its side padding is
// already excluded, so only the day-of-week gutter comes off here.
function fitCell(contentWidth, weekCount) {
  if (!contentWidth || !weekCount) return BASE_CELL;
  const pitch = (contentWidth - DAY_GUTTER) / weekCount;
  return Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(pitch / 1.42)));
}

// Height comes from the raw commit count rather than GitHub's 5-step level, so a
// 12-commit day out-ranks a 5-commit one instead of sharing a bucket with it.
// Scaled against the 95th percentile because one 40-commit outlier would
// otherwise squash the whole rest of the year flat, and curved (^0.62) so the
// first few commits of a day buy the most height.
function makeHeightScale(contributions, minZ, maxZ) {
  const counts = contributions
    .filter((d) => d && d.count > 0)
    .map((d) => d.count)
    .sort((a, b) => a - b);
  if (counts.length === 0) return () => 0;
  const p95 = counts[Math.min(counts.length - 1, Math.floor(counts.length * 0.95))];
  const scale = Math.max(p95, 1);
  return (count) => {
    if (!count) return 0;
    const t = Math.min(1, count / scale) ** 0.62;
    return Math.round(minZ + (maxZ - minZ) * t);
  };
}

function ContributionHeatmap({ contributions, totalThisYear, year }) {
  const reducedMotion = usePrefersReducedMotion();
  const boardRef = useRef(null);
  const wrapRef = useRef(null);
  const gh = GH[useThemeMode()];
  const LEVEL_COLORS = gh.levels;
  const weeks = useMemo(() => {
    if (!contributions || contributions.length === 0) return [];
    const out = [];
    // A calendar year starts on whatever weekday it starts on, so the first column
    // is padded with blanks up to Jan 1's weekday. Chunking straight into sevens
    // would shear every row off its true day for the rest of the year.
    let week = new Array(parseDay(contributions[0].date).getDay()).fill(null);
    contributions.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        out.push(week);
        week = [];
      }
    });
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      out.push(week);
    }
    return out;
  }, [contributions]);

  // Derived from the padded weeks rather than counted off the raw day list, so a
  // label can never drift out of step with the column it points at.
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = null;
    weeks.forEach((week, weekIdx) => {
      const firstReal = week.find(Boolean);
      if (!firstReal) return;
      const m = parseDay(firstReal.date).getMonth();
      if (m !== lastMonth) {
        labels.push({ month: MONTHS[m], weekIdx });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks]);

  // Width of the panel the board has to fill. Measured rather than assumed, because
  // the panel is fluid and the week count changes with the selected year.
  //
  // The first measurement runs in a layout effect, not a passive one: layout effects
  // are flushed before the browser paints, so the corrected size is already in the
  // DOM by the first frame. With useEffect the board painted once at the fallback
  // 12px cell and then snapped to its real size — the visible glitch on load.
  const [availWidth, setAvailWidth] = useState(0);
  useLayoutEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const measure = (el) => {
      const cs = getComputedStyle(el);
      return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    };
    setAvailWidth(measure(node));
    const ro = new ResizeObserver(([entry]) => setAvailWidth(entry.contentRect.width));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const { CELL, GAP, MAX_Z, MIN_Z, HEADROOM, FORESHORTEN } = useMemo(
    () => boardMetrics(fitCell(availWidth, weeks.length)),
    [availWidth, weeks.length]
  );

  const heightFor = useMemo(
    () => makeHeightScale(contributions ?? [], MIN_Z, MAX_Z),
    [contributions, MIN_Z, MAX_Z]
  );

  // Only let the tiles bob while the board is actually on screen.
  useEffect(() => {
    const node = boardRef.current;
    if (!node || reducedMotion) return;
    const io = new IntersectionObserver(
      ([entry]) => node.classList.toggle("gh-live", entry.isIntersecting),
      { rootMargin: "100px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reducedMotion]);

  const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
  const totalWidth = weeks.length * (CELL + GAP);
  // Vertical drop the yaw introduces at the board's far corner: half the width is
  // the lever arm, sin(YAW) the drop per unit of it.
  const YAW_DROP = Math.ceil((totalWidth / 2) * Math.abs(Math.sin((YAW * Math.PI) / 180)));

  return (
    // overflow-y is pinned to hidden because CSS won't let one axis scroll while the
    // other stays visible: `overflow-x: auto` silently promotes a visible y to auto,
    // which put a 16px vertical scrollbar on the panel. Nothing needs to escape
    // vertically — tiles rise into HEADROOM, which is real layout space inside this
    // box — so clipping that axis costs nothing.
    <div ref={wrapRef} style={{ overflowX: "auto", overflowY: "hidden", paddingBottom: 8, paddingLeft: SIDE_PAD, paddingRight: SIDE_PAD }}>
      <div style={{ display: "flex", gap: 8, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: C.secondary, marginBottom: 4 }}>
        <span style={{ color: C.sage, fontWeight: 700 }}>{totalThisYear?.toLocaleString()}</span>
        <span>{year === "last" ? "contributions in the last year" : `contributions in ${year}`}</span>
      </div>
      {/* Tilt wrapper — labels and grid are children of the SAME rotated block, so they move
          together as one rigid unit and stay perfectly aligned regardless of tilt angle. */}
      <div
        ref={boardRef}
        style={{
          perspective: reducedMotion ? "none" : PERSPECTIVE,
          paddingTop: reducedMotion ? 0 : 16,
          // The yaw rotates the board about its top-centre, which swings one bottom
          // corner below the height the untilted layout reserved for it — measured
          // as ~4px of the last row being clipped by the overflow container. The
          // allowance scales with the board's half-width, since that is the lever
          // arm the rotation acts on.
          paddingBottom: reducedMotion ? 0 : 12 + YAW_DROP,
          marginBottom: reducedMotion ? 0 : -FORESHORTEN,
        }}
      >
        <div
          style={{
            display: "flex",
            // Shrink-wrap the board to its columns. Left to fill, the rotated
            // block's own bbox spreads past the scroll container and keeps a stray
            // few px of scroll alive.
            width: "fit-content",
            transformStyle: reducedMotion ? "flat" : "preserve-3d",
            transform: reducedMotion ? "none" : `rotateX(${TILT}deg) rotateZ(${YAW}deg)`,
            transformOrigin: "top",
          }}
        >
          {/* Day-of-week labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP, marginRight: 6, paddingTop: 18 + (reducedMotion ? 0 : HEADROOM) }}>
            {DAY_LABELS.map((label, i) => (
              <div key={i} style={{ height: CELL, fontSize: 10, fontWeight: 500, color: gh.label, fontFamily: "'JetBrains Mono',monospace", lineHeight: `${CELL}px`, textAlign: "right", whiteSpace: "nowrap" }}>
                {label}
              </div>
            ))}
          </div>
          {/* preserve-3d has to be unbroken from the rotated block all the way down to
              the tiles — a single `flat` element anywhere in the chain (the default)
              collapses every descendant into its own plane and the lift renders as
              nothing at all. */}
          <div style={{ flex: "0 0 auto", transformStyle: reducedMotion ? "flat" : "preserve-3d" }}>
            {/* Month labels. Absolutely positioned rather than laid out in flow and
                nudged with `left`: relative offsets still occupy their original slot
                *and* overhang past it, which was inflating the horizontal scroll
                area to more than twice the grid and letting the board scroll into a
                screenful of nothing. */}
            <div style={{ position: "relative", height: 12, marginBottom: 4, width: totalWidth }}>
              {monthLabels.map((ml, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: ml.weekIdx * (CELL + GAP),
                    fontSize: 10,
                    fontWeight: 500,
                    color: gh.label,
                    fontFamily: "'JetBrains Mono',monospace",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ml.month}
                </div>
              ))}
            </div>
            {/* Grid — each lit tile floats above its socket, height ∝ that day's commit count */}
            {/* Width is pinned to the columns rather than left to stretch: as a
                block-level flex container this filled its parent, so the scroll area
                ran hundreds of pixels past the last week into empty box. */}
            <div style={{ display: "flex", gap: GAP, width: totalWidth, marginTop: reducedMotion ? 0 : HEADROOM, transformStyle: reducedMotion ? "flat" : "preserve-3d" }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP, flexShrink: 0, transformStyle: reducedMotion ? "flat" : "preserve-3d" }}>
                  {week.map((day, di) => {
                    if (!day) return <div key={di} style={{ width: CELL, height: CELL }} />;
                    const level = day.level ?? 0;
                    const color = LEVEL_COLORS[level];
                    const z = reducedMotion ? 0 : heightFor(day.count);
                    const title = `${day.date}: ${day.count} contributions`;
                    const lit = level > 0 && !reducedMotion;
                    const delay = `${((wi + di) % 12) * 0.4}s`;
                    return (
                      <div key={di} className="gh-cell" style={{ width: CELL, height: CELL }}>
                        {/* Socket — stays flush with the board so the lit tile has
                            something to visibly float away from, and catches the tile's
                            light so you can read which square it belongs to. */}
                        <div
                          className="gh-socket"
                          title={level > 0 ? undefined : title}
                          style={{
                            background: lit
                              ? `linear-gradient(${color}2b, ${color}2b), ${gh.empty}`
                              : gh.empty,
                            border: `1px solid ${lit ? `${color}4d` : gh.line}`,
                            // Contact shadow rather than a glow: a tight dark inset
                            // under a lit pillar reads as the tile sitting *on* the
                            // board (cheap ambient occlusion), where the old outward
                            // bloom just smeared green over the neighbouring days.
                            boxShadow: lit ? `inset 0 0 4px 1px rgba(0,0,0,0.55)` : "none",
                          }}
                        />
                        {lit && (
                          <div
                            className="gh-beam"
                            style={{
                              "--z": z,
                              "--delay": delay,
                              // Brightest where it meets the underside of the tile,
                              // fading out before it reaches the board — a shaft of
                              // light, not a bar-chart column.
                              // Dimmer than before, and narrower in its falloff: the
                              // side wall should describe the pillar's height, not
                              // cast a murky halo across the tiles either side of it.
                              background: `linear-gradient(to bottom, ${color}00 0%, ${color}1f 45%, ${color}66 100%)`,
                            }}
                          />
                        )}
                        {level > 0 && (
                          <div
                            className="gh-tile"
                            title={title}
                            style={{
                              "--z": z,
                              // Diagonal offset so the bob crosses the board as a
                              // slow wave instead of every tile pulsing in unison.
                              "--delay": delay,
                              // Top cap lit from above: a lighter wash across the
                              // face plus a bright top edge, so the cap reads as a
                              // distinct surface from the side wall beneath it
                              // instead of the whole pillar being one flat colour.
                              background: `linear-gradient(160deg, ${color}, ${shade(color, -18)})`,
                              borderTop: `1px solid ${shade(color, 42)}`,
                              borderLeft: `1px solid ${shade(color, 16)}`,
                              borderRight: `1px solid ${shade(color, -22)}`,
                              borderBottom: `1px solid ${shade(color, -30)}`,
                              boxShadow: reducedMotion
                                ? "none"
                                : `0 ${Math.round(z * 0.3)}px ${Math.round(z * 0.4) + 6}px -4px ${color}77`,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 10, color: C.secondary, fontFamily: "'JetBrains Mono',monospace" }}>
        <span>Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: i === 0 ? gh.empty : c, border: `1px solid ${gh.line}` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function LeetCodeStats({ stats, loading, error }) {
  const lc = LC[useThemeMode()];
  const cards = loading
    ? [
      { label: "Total Solved", value: "…", color: C.accentText },
      { label: "Easy", value: "…", color: lc.easy },
      { label: "Medium", value: "…", color: lc.medium },
      { label: "Hard", value: "…", color: lc.hard },
    ]
    : error || !stats
      ? null
      : [
        { label: "Total Solved", value: stats.totalSolved ?? "—", color: C.accentText },
        { label: "Easy", value: stats.easySolved ?? "—", color: lc.easy },
        { label: "Medium", value: stats.mediumSolved ?? "—", color: lc.medium },
        { label: "Hard", value: stats.hardSolved ?? "—", color: lc.hard },
      ];

  if (!loading && (error || !stats)) {
    return (
      <div style={{ fontSize: 12, color: C.secondary, fontFamily: "'JetBrains Mono',monospace", padding: "16px 0" }}>
        LeetCode stats unavailable (API unreachable)
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        {cards?.map((card, i) => (
          <div
            key={i}
            style={{
              flex: "1 1 80px",
              padding: "14px 16px",
              borderRadius: 12,
              background: `${card.color}12`,
              border: `1px solid ${card.color}30`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: card.color, marginBottom: 4 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 10, color: C.secondary, textTransform: "uppercase", letterSpacing: "0.1em" }}>{card.label}</div>
          </div>
        ))}
      </div>
      {stats?.ranking && (
        <div style={{ fontSize: 12, color: C.secondary, fontFamily: "'JetBrains Mono',monospace" }}>
          Global Rank: <span style={{ color: C.accentText, fontWeight: 700 }}>#{stats.ranking?.toLocaleString()}</span>
          {stats.acceptanceRate != null && (
            <span style={{ marginLeft: 16 }}>
              Acceptance: <span style={{ color: C.sage }}>{typeof stats.acceptanceRate === "number" ? `${stats.acceptanceRate.toFixed(1)}%` : stats.acceptanceRate}</span>
            </span>
          )}
        </div>
      )}
      <a
        href={`https://leetcode.com/${LEETCODE_USERNAME}`}
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 12, color: lc.medium, textDecoration: "none", fontFamily: "'JetBrains Mono',monospace" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        leetcode.com/{LEETCODE_USERNAME} →
      </a>
    </div>
  );
}

export function GitHubSection() {
  const [year, setYear] = useState("last");
  const { data: ghData, loading: ghLoading, error: ghError } = useGitHubContributions(year);
  const { stats: lcStats, loading: lcLoading, error: lcError } = useLeetCodeStats();
  const gh = GH[useThemeMode()];

  // Recomputed rather than hardcoded so the list keeps extending itself every
  // January instead of quietly going stale.
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: now - GITHUB_JOINED_YEAR + 1 }, (_, i) => now - i);
  }, []);

  const contributions = ghData?.contributions ?? [];
  const totalThisYear = ghData?.total ? Object.values(ghData.total).reduce((a, b) => a + b, 0) : null;

  return (
    <Section id="github" label="04 / Activity" title="Building Consistently" watermark="ACTIVITY">
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Full-width calendar — everything else moved to the compact row below. */}
        <FadeUp delay={80}>
            <div
              className="glass"
              style={{
                borderRadius: 16,
                padding: "24px 28px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.14em", color: gh.muted, margin: "0 0 4px" }}>
                    GitHub Contributions
                  </p>
                  <a
                    href={`https://github.com/${GITHUB_USERNAME}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 13, color: gh.link, textDecoration: "none", fontFamily: "'JetBrains Mono',monospace" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    @{GITHUB_USERNAME}
                  </a>
                </div>
                <div
                  className="gh-years"
                  role="group"
                  aria-label="Contribution year"
                  style={{
                    "--gh-year-hover": gh.yearHover,
                    "--gh-year-active-bg": gh.yearActiveBg,
                    "--gh-year-active-fg": gh.yearActiveFg,
                    color: gh.link,
                  }}
                >
                  {["last", ...years].map((y) => (
                    <button
                      key={y}
                      type="button"
                      className="gh-year"
                      aria-current={year === y}
                      onClick={() => setYear(y)}
                    >
                      {y === "last" ? "Last 12mo" : y}
                    </button>
                  ))}
                </div>
              </div>
              {/* Held at the board's own height so the panel doesn't collapse and then
                  snap back open when the fetch lands — switching years would jolt the
                  whole page otherwise. */}
              {ghLoading && (
                <div style={{ minHeight: BOARD_MIN_H, display: "grid", placeItems: "center", fontSize: 12, color: gh.muted, fontFamily: "'JetBrains Mono',monospace" }}>
                  Loading contributions…
                </div>
              )}
              {ghError && !ghLoading && (
                <div style={{ minHeight: BOARD_MIN_H, display: "grid", placeItems: "center", fontSize: 12, color: gh.muted, fontFamily: "'JetBrains Mono',monospace" }}>
                  GitHub API unavailable — contributions not shown.
                </div>
              )}
              {!ghLoading && !ghError && contributions.length > 0 && (
                <ContributionHeatmap key={year} contributions={contributions} totalThisYear={totalThisYear} year={year} />
              )}
            </div>
        </FadeUp>

        {/* Every other stat — LeetCode, stars/commits/PRs/issues/grade, streak,
            top languages — as one row of compact cards below the full-size
            calendar, instead of one of them (LeetCode) crowding the calendar's
            own row while the rest sit further down. */}
        <FadeUp delay={140}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div className="glass" style={{ borderRadius: 16, padding: "20px 22px", flex: "0 1 300px" }}>
              <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.14em", color: C.secondary, margin: "0 0 16px" }}>
                LeetCode Stats
              </p>
              <LeetCodeStats stats={lcStats} loading={lcLoading} error={lcError} />
            </div>
            <GitHubStatsCards username={GITHUB_USERNAME} />
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
