import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import IconForTech, { getTechColor } from "./Icons";
import C, { alpha } from "../theme";
import {
  FLOW_CORE,
  FLOW_CLUSTERS,
  getFlowItem,
} from "../utils/flowchartData";

// Each cluster connects into a DIFFERENT point on the core box's edge, so lines
// never share a row/column and can't visually merge into one trunk. `side` is
// which edge of the core box the line lands on; `t` is how far along that edge
// (0 = top/left, 1 = bottom/right).
const CORE_SIDE_MAP = {
  infra: { side: "left", t: 0.28 },
  frontend: { side: "left", t: 0.75 },
  integrations: { side: "right", t: 0.28 },
  data: { side: "right", t: 0.75 },
  payments: { side: "bottom", t: 0.5 },
};

function getCoreEdgePoint(core, side, t) {
  if (side === "left") return { x: core.left, y: core.top + t * (core.bottom - core.top) };
  if (side === "right") return { x: core.right, y: core.top + t * (core.bottom - core.top) };
  return { x: core.left + t * (core.right - core.left), y: core.bottom }; // bottom
}

export default function SystemFlowchart() {
  const [selectedId, setSelectedId] = useState(FLOW_CORE.items[0].id);
  const [activeCluster, setActiveCluster] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const selected = useMemo(() => getFlowItem(selectedId), [selectedId]);

  const nodeCount = FLOW_CLUSTERS.reduce((n, c) => n + c.items.length, 0) + FLOW_CORE.items.length;

  const GOLD = C.accentText;            // accent used as ink here
  const GOLD_FILL = C.gold;             // accent used as fill/border
  const GOLD_GLOW = alpha(GOLD_FILL, "44");

  const getIconStyle = (itemId, extra = {}) => {
    const isHovered = hoveredId === itemId;
    const dimmed = hoveredId !== null && !isHovered;
    return {
      opacity: dimmed ? 0.32 : 1,
      filter: dimmed ? "saturate(0.4)" : "none",
      transform: isHovered ? "scale(1.06)" : "scale(1)",
      transition: "opacity 0.2s ease, filter 0.2s ease, transform 0.2s ease",
      ...extra,
    };
  };

  const canvasRef = useRef(null);
  const clusterRefs = useRef({});
  const coreRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ w: 1000, h: 600 });
  const [edgePaths, setEdgePaths] = useState({});

  const measure = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(200, Math.round(rect.width));
    const h = Math.max(200, Math.round(rect.height));

    const coreBoxEl = coreRef.current?.getBoundingClientRect();
    const core = coreBoxEl
      ? {
          left: Math.round(coreBoxEl.left - rect.left),
          top: Math.round(coreBoxEl.top - rect.top),
          right: Math.round(coreBoxEl.right - rect.left),
          bottom: Math.round(coreBoxEl.bottom - rect.top),
        }
      : { left: w / 2 - 60, top: h / 2 - 60, right: w / 2 + 60, bottom: h / 2 + 60 };

    const newPaths = {};
    FLOW_CLUSTERS.forEach(cluster => {
      const el = clusterRefs.current[cluster.id];
      if (!el) return;
      const b = el.getBoundingClientRect();
      const left = b.left - rect.left;
      const top = b.top - rect.top;
      const right = left + b.width;
      const bottom = top + b.height;
      const cx = left + b.width / 2;
      const cy = top + b.height / 2;

      const { side, t } = CORE_SIDE_MAP[cluster.id] || { side: "left", t: 0.5 };
      const to = getCoreEdgePoint(core, side, t);

      const vx = to.x - cx;
      const vy = to.y - cy;
      const pad = 6;
      let ax = cx;
      let ay = cy;
      const absVx = Math.abs(vx);
      const absVy = Math.abs(vy);
      if (absVx > absVy) {
        ax = vx > 0 ? right + pad : left - pad;
      } else {
        ay = vy > 0 ? bottom + pad : top - pad;
      }
      newPaths[cluster.id] = { from: { x: ax, y: ay }, to };
    });

    setCanvasSize({ w, h });
    setEdgePaths(newPaths);
  };

  useLayoutEffect(() => {
    measure();
  }, []);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    if (canvasRef.current) ro.observe(canvasRef.current);
    if (coreRef.current) ro.observe(coreRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  const mobile = canvasSize.w < 720;

  const IconUnit = ({ item, size, iconSize, innerSize, glow }) => {
    const on = selectedId === item.id;
    const brandColor = getTechColor(item.name);
    return (
      <div
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: size + 8, ...getIconStyle(item.id) }}
      >
        <button
          type="button"
          onClick={() => setSelectedId(item.id)}
          style={{
            width: size,
            height: size,
            padding: 0,
            borderRadius: Math.round(size * 0.28),
            border: `1px solid ${on ? GOLD : `${brandColor}40`}`,
            background: on ? `${GOLD}1E` : `${brandColor}0F`,
            boxShadow: on && glow ? `0 0 16px ${GOLD_GLOW}` : on ? `0 0 14px ${brandColor}40` : "none",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ width: innerSize, height: innerSize, borderRadius: Math.round(innerSize * 0.3), display: "grid", placeItems: "center", background: C.bg, border: `1px solid ${brandColor}30` }}>
            <IconForTech name={item.name} size={iconSize} colored={true} />
          </div>
        </button>
        <span style={{ fontSize: 10.5, fontWeight: 700, textAlign: "center", lineHeight: 1.2, color: on ? GOLD : C.primary }}>
          {item.name}
        </span>
      </div>
    );
  };

  const renderClusterItems = (cluster, size = 52, iconSize = 15, innerSize = 26) => {
    const columns = cluster.id === "payments" ? "repeat(6, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))";
    return (
      <div style={{ display: "grid", gridTemplateColumns: columns, gap: 10, justifyItems: "center" }}>
        {cluster.items.map(item => (
          <IconUnit key={item.id} item={item} size={size} iconSize={iconSize} innerSize={innerSize} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: 16, alignItems: "stretch" }} className="flowchart-layout">
      {/* ── Canvas ── */}
      <div
        ref={canvasRef}
        style={{
          position: "relative",
          minHeight: 460,
          borderRadius: C.radius,
          border: `1px solid ${C.border}`,
          background: C.bg || "linear-gradient(160deg, #0E0E0E 0%, #141414 50%, #1A1A1A 100%)",
          boxShadow: "0 8px 40px var(--shadow-hover), inset 0 1px 0 rgba(255,255,255,0.04)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {mobile ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 10 }}>
            <div ref={coreRef} style={{ marginBottom: 10, textAlign: "center" }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.18em", color: GOLD, margin: "0 0 6px", fontWeight: 700 }}>{FLOW_CORE.label}</p>
              <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${GOLD}`, background: C.surface, boxShadow: `0 8px 24px ${GOLD_GLOW}`, display: "flex", gap: 10 }}>
                {FLOW_CORE.items.map(item => (
                  <IconUnit key={item.id} item={item} size={48} iconSize={14} innerSize={24} glow />
                ))}
              </div>
            </div>

            <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {FLOW_CLUSTERS.map(cluster => {
                const lit = activeCluster === cluster.id || cluster.items.some(i => i.id === selectedId);
                return (
                  <div
                    key={cluster.id}
                    ref={el => { if (el) clusterRefs.current[cluster.id] = el; }}
                    style={{ padding: 8, borderRadius: C.radius, border: `1px solid ${lit ? GOLD : C.border}`, background: lit ? "rgba(124,140,255,0.05)" : C.surface, gridColumn: cluster.id === "payments" ? "1 / -1" : "auto" }}
                  >
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: lit ? GOLD : C.secondary, margin: "0 0 8px", fontWeight: 600 }}>{cluster.label}</p>
                    {renderClusterItems(cluster, 44, 13, 22)}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* SVG connection lines — one distinct S-curve per cluster, landing on
                its own point on the core box (see CORE_SIDE_MAP), so the 4 side
                lines (+ 1 bottom line for Payments) never overlap into a trunk.
                NOTE: this iterates FLOW_CLUSTERS (and relies on edgePaths, which
                is derived from CORE_SIDE_MAP) rather than FLOW_EDGES, so a
                cluster is never silently skipped just because FLOW_EDGES is
                missing an entry for it. */}
            <svg
              viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
              preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            >
              <defs>
                {/* filterUnits="userSpaceOnUse" with a fixed canvas-sized region is
                    important here: the default objectBoundingBox units size the
                    filter region as a % of the PATH's OWN bounding box. The four
                    side connectors are wide S-curves so that's fine, but the
                    payments/bottom connector is a near-vertical line with a
                    near-zero-width bounding box — under objectBoundingBox units
                    that collapses the filter region and makes the glowed path
                    disappear entirely whenever it becomes active. Using a fixed
                    user-space region avoids that collapse for any path shape. */}
                <filter
                  id="flow-glow"
                  filterUnits="userSpaceOnUse"
                  x={-100}
                  y={-100}
                  width={canvasSize.w + 200}
                  height={canvasSize.h + 200}
                >
                  <feGaussianBlur stdDeviation="0.6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {FLOW_CLUSTERS.map(cluster => {
                const p = edgePaths[cluster.id];
                if (!p) return null;
                const { from, to, side } = p;
                const active = activeCluster === cluster.id || cluster.items.some(i => i.id === selectedId);

                  const midX = from.x + (to.x - from.x) * 0.5;
                const path =
                  from.x === to.x
                    ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
                    : from.y === to.y
                    ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
                    : `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;

                return (
                  <path
                    key={cluster.id}
                    d={path}
                    fill="none"
                    stroke={active ? GOLD : "rgba(124,140,255,0.16)"}
                    strokeWidth={active ? 2 : 1}
                    strokeLinecap="round"
                    filter={active ? "url(#flow-glow)" : undefined}
                  />
                );
              })}
            </svg>

            {/* CSS Grid layout */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "grid",
                gridTemplateColumns: "minmax(170px, 1fr) minmax(150px, 190px) minmax(170px, 1fr)",
                gridTemplateAreas: `"infra core integrations" "frontend core data" "payments payments payments"`,
                gap: 16,
                padding: 18,
              }}
            >
              {FLOW_CLUSTERS.map(cluster => {
                const lit = activeCluster === cluster.id || cluster.items.some(i => i.id === selectedId);
                return (
                  <div
                    key={cluster.id}
                    onMouseEnter={() => setActiveCluster(cluster.id)}
                    onMouseLeave={() => setActiveCluster(null)}
                    ref={el => { if (el) clusterRefs.current[cluster.id] = el; }}
                    style={{
                      gridArea: cluster.id,
                      alignSelf: "start",
                      justifySelf: "stretch",
                      padding: "10px 12px",
                      borderRadius: C.radius,
                      border: `1px solid ${lit ? GOLD : C.border}`,
                      background: lit ? "rgba(124,140,255,0.07)" : C.surface,
                      boxShadow: lit ? `0 0 18px ${GOLD_GLOW}` : "0 4px 12px rgba(0,0,0,0.4)",
                      transition: "border-color 0.25s, box-shadow 0.25s, background 0.25s",
                    }}
                  >
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.18em", color: lit ? GOLD : C.secondary, margin: "0 0 10px", fontWeight: 600 }}>
                      {cluster.label}
                    </p>
                    {renderClusterItems(cluster)}
                  </div>
                );
              })}

              {/* Core engine */}
              <div
                ref={coreRef}
                style={{
                  gridArea: "core",
                  alignSelf: "center",
                  justifySelf: "center",
                  textAlign: "center",
                  padding: "12px 14px",
                  borderRadius: 18,
                  border: `1px solid ${GOLD}`,
                  background: C.surface,
                  boxShadow: `0 0 24px ${GOLD_GLOW}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 150,
                }}
              >
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.22em", color: GOLD, margin: 0, fontWeight: 700 }}>
                  {FLOW_CORE.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {FLOW_CORE.items.map(item => (
                    <IconUnit key={item.id} item={item} size={56} iconSize={17} innerSize={28} glow />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Telemetry sidebar ── */}
      <div
        style={{
          borderRadius: C.radius,
          border: `1px solid ${C.border}`,
          background: C.surface,
          padding: "18px 16px",
          boxShadow: "0 4px 24px var(--shadow-base), var(--shadow-inset)",
          display: "flex",
          flexDirection: "column",
          minHeight: 460,
        }}
      >
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.18em", color: GOLD, margin: "0 0 16px", fontWeight: 600 }}>
          TELEMETRY // SPECIFICATION
        </p>

        {(() => {
          const isAuth = selected.nodeClass === "Auth" || selected.id === "oauth";
          return (
            <span
              style={{
                display: "inline-block",
                padding: "3px 9px",
                borderRadius: 6,
                fontSize: 10.5,
                fontFamily: "'JetBrains Mono', monospace",
                border: `1px solid ${isAuth ? GOLD : C.border}`,
                color: isAuth ? GOLD : C.secondary,
                background: isAuth ? "rgba(124,140,255,0.05)" : "transparent",
                marginBottom: 12,
                width: "fit-content",
              }}
            >
              {selected.nodeClass}
            </span>
          );
        })()}

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 12px" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              flexShrink: 0,
              background: `${getTechColor(selected.name)}18`,
              border: `1px solid ${getTechColor(selected.name)}40`,
              display: "grid",
              placeItems: "center",
              boxShadow: `0 4px 12px ${getTechColor(selected.name)}20`,
            }}
          >
            <IconForTech name={selected.name} size={22} colored={true} />
          </div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700, color: C.primary, margin: 0, lineHeight: 1.1 }}>
            {selected.name}
          </h3>
        </div>

        <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: C.secondary, margin: "0 0 6px", letterSpacing: "0.08em" }}>
          PRODUCTION ROLE
        </p>
        <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, margin: "0 0 16px" }}>
          {selected.role}
        </p>

        <div
          style={{
            padding: "12px 14px",
            borderRadius: C.radius,
            border: `1px dashed ${C.border}`,
            background: "rgba(124,140,255,0.05)",
            marginBottom: 18,
          }}
        >
          <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: GOLD, margin: "0 0 6px", letterSpacing: "0.08em" }}>
            DEPLOYMENT NOTE
          </p>
          <p style={{ fontSize: 12.5, color: C.secondary, lineHeight: 1.6, margin: 0 }}>
            {selected.deploymentNote}
          </p>
        </div>

        <div style={{ marginTop: "auto", borderTop: `1px dotted ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["System Status", "CONNECTED"],
            ["Topology", `${nodeCount} active nodes`],
            ["Network", "centered on Rails 7"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: C.secondary }}>{k}</span>
              <span style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: k === "System Status" ? GOLD : C.primary, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}