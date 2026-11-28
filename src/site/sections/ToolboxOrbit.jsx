import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconForTech } from "../../components/Icons";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

// Per-ring shape and motion: tilt (how far the ring leans back), roll (its
// in-plane rotation on screen) and angular speed. Alternating directions keep
// neighbouring rings from moving as one block.
// Tilt grows outward so each shell opens up taller than the one inside it,
// rather than five rings crowding the same horizontal band.
const RINGS = [
  { tilt: 36, roll: -6, speed: 0.14 },
  { tilt: 39, roll: 5, speed: -0.1 },
  { tilt: 42, roll: -4, speed: 0.08 },
  { tilt: 45, roll: 5, speed: -0.07 },
  { tilt: 48, roll: -4, speed: 0.06 },
];
const FRONT = Math.PI / 2; // the angle at which a chip is nearest the viewer
const HEIGHT = 620;
const TAU = Math.PI * 2;
const wrap = (a) => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
const ease = (t) => 1 - Math.pow(1 - t, 3);

/**
 * The stack as electron shells: each group orbits the core engine on its own
 * tilted ring. Positions are integrated per frame and written straight to the
 * chips (React state would re-render 25 nodes 60×/sec). Drag spins with
 * inertia; hovering pauses the drift so a chip can be clicked; selecting a chip
 * swings its ring to bring it to the front.
 */
export function ToolboxOrbit({ core, groups, selectedId, onSelect }) {
  const reduced = usePrefersReducedMotion();
  const stageRef = useRef(null);
  const chipRefs = useRef({});
  const [width, setWidth] = useState(760);
  // Read by the frame loop; a ref so a new selection doesn't restart the loop.
  const selRef = useRef(selectedId);
  selRef.current = selectedId;
  // Only one ring is "open" (full labels); the rest orbit as icon bubbles. It
  // follows the selection, and stays put while a core chip is selected.
  const selectedGroup = groups.findIndex((g) => g.items.some((i) => i.id === selectedId));
  const activeRef = useRef(0);
  if (selectedGroup >= 0) activeRef.current = selectedGroup;
  const active = activeRef.current;
  const sim = useRef({
    phases: groups.map((_, i) => i * 0.9),
    offset: 0,
    vel: 0,
    hover: false,
    drag: null,
    focus: null,
    visible: true,
  });

  // Evenly spaced from just outside the core to the stage edge.
  // The inner ring must clear the nucleus vertically too (ry = r·sin(tilt)).
  const rIn = Math.max(190, width * 0.27);
  const rOut = Math.max(rIn + 40, width / 2 - 82);
  const radii = groups.map((_, i) => rIn + ((rOut - rIn) * i) / Math.max(1, groups.length - 1));
  const rMax = Math.max(...radii);

  useLayoutEffect(() => {
    const el = stageRef.current;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Swing the selected chip's ring so the chip comes round to the front.
  useEffect(() => {
    const gi = groups.findIndex((g) => g.items.some((i) => i.id === selectedId));
    if (gi < 0) return;
    const s = sim.current;
    const k = groups[gi].items.findIndex((i) => i.id === selectedId);
    const angle = s.phases[gi] + s.offset + (TAU * k) / groups[gi].items.length;
    const from = s.phases[gi];
    s.focus = { ring: gi, from, to: from + wrap(FRONT - angle), start: performance.now() };
  }, [selectedId, groups]);

  useEffect(() => {
    const s = sim.current;
    // Off screen the loop stops outright rather than spinning idle frames.
    let raf = 0;
    let last = performance.now();
    const io = new IntersectionObserver(
      ([e]) => {
        s.visible = e.isIntersecting;
        if (s.visible && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(stageRef.current);
    const cx = width / 2;
    const cy = HEIGHT / 2;

    const place = () => {
      groups.forEach((g, gi) => {
        const { tilt, roll } = RINGS[gi % RINGS.length];
        const phi = (tilt * Math.PI) / 180;
        const psi = (roll * Math.PI) / 180;
        const r = radii[gi];
        g.items.forEach((it, k) => {
          const el = chipRefs.current[it.id];
          if (!el) return;
          const th = s.phases[gi] + s.offset + (TAU * k) / g.items.length;
          const x0 = r * Math.cos(th);
          const y0 = r * Math.sin(th) * Math.sin(phi);
          const z = r * Math.sin(th) * Math.cos(phi);
          const x = x0 * Math.cos(psi) - y0 * Math.sin(psi);
          const y = x0 * Math.sin(psi) + y0 * Math.cos(psi);
          const d = (z / rMax + 1) / 2; // 0 back … 1 front
          const open = gi === activeRef.current;
          // The open ring stays legible all the way round and always draws over
          // the icon bubbles; bubbles fade further at the back.
          const sc = open ? 0.86 + d * 0.18 : 0.7 + d * 0.32;
          const op = it.id === selRef.current ? 1 : open ? 0.62 + d * 0.38 : 0.25 + d * 0.6;
          el.style.transform = `translate(-50%, -50%) translate3d(${cx + x}px, ${cy + y}px, 0) scale(${sc.toFixed(3)})`;
          el.style.opacity = op.toFixed(3);
          el.style.zIndex = String(Math.round((open ? 900 : 500) + z));
        });
      });
    };

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!s.visible) {
        raf = 0;
        return;
      }
      {
        if (!s.drag) {
          s.offset += s.vel;
          s.vel *= 0.94;
          if (Math.abs(s.vel) < 1e-4) s.vel = 0;
        }
        groups.forEach((_, gi) => {
          if (s.focus?.ring === gi) {
            const t = Math.min(1, (now - s.focus.start) / 750);
            s.phases[gi] = s.focus.from + (s.focus.to - s.focus.from) * ease(t);
            if (t >= 1) s.focus = null;
          } else if (!s.hover && !s.drag && !reduced) {
            s.phases[gi] += RINGS[gi % RINGS.length].speed * dt;
          }
        });
        place();
      }
      raf = requestAnimationFrame(tick);
    }
    place();
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // radii/rMax derive from width.
  }, [width, groups, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerDown = (e) => {
    sim.current.drag = { x: e.clientX, moved: 0 };
    sim.current.lastMoved = 0;
    sim.current.vel = 0;
  };
  const onPointerMove = (e) => {
    const s = sim.current;
    if (!s.drag) return;
    const dx = e.clientX - s.drag.x;
    s.drag.x = e.clientX;
    s.drag.moved += Math.abs(dx);
    s.offset += dx * 0.006;
    s.vel = dx * 0.006;
  };
  const endDrag = () => {
    sim.current.drag = null;
  };
  // A press that travelled is a spin, not a click.
  const pick = (id) => (e) => {
    if ((sim.current.drag?.moved ?? sim.current.lastMoved ?? 0) > 6) {
      e.preventDefault();
      return;
    }
    onSelect(id);
  };
  const onPointerUp = () => {
    sim.current.lastMoved = sim.current.drag?.moved ?? 0;
    endDrag();
  };

  return (
    <div
      ref={stageRef}
      className="orbit"
      style={{ height: HEIGHT }}
      onPointerEnter={() => (sim.current.hover = true)}
      onPointerLeave={() => {
        sim.current.hover = false;
        endDrag();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg className="orbit-rings" width={width} height={HEIGHT} aria-hidden="true">
        {groups.map((g, gi) => {
          const { tilt, roll } = RINGS[gi % RINGS.length];
          const r = radii[gi];
          return (
            <ellipse
              key={g.id}
              cx={width / 2}
              cy={HEIGHT / 2}
              rx={r}
              ry={r * Math.sin((tilt * Math.PI) / 180)}
              transform={`rotate(${roll} ${width / 2} ${HEIGHT / 2})`}
              className={gi === active ? "is-on" : ""}
            />
          );
        })}
      </svg>

      {/* The nucleus: a lit sphere with the three core pieces set inside it. */}
      <div className="orbit-core" style={{ zIndex: 700 }}>
        <div className="nucleus">
          <span className="nucleus-glow" aria-hidden="true" />
          <span className="nucleus-ring" aria-hidden="true" />
          <span className="nucleus-sphere" aria-hidden="true" />
          {core.items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              aria-pressed={it.id === selectedId}
              aria-label={it.name}
              title={it.name}
              className={`nucleus-btn nucleus-btn-${i + 1} cursor-target${it.id === selectedId ? " is-on" : ""}`}
              onClick={pick(it.id)}
            >
              <IconForTech name={it.name} size={i === 0 ? 22 : 17} colored={false} />
            </button>
          ))}
        </div>
      </div>

      {groups.map((g, gi) =>
        g.items.map((it) => (
          <button
            key={it.id}
            ref={(el) => (chipRefs.current[it.id] = el)}
            type="button"
            aria-pressed={it.id === selectedId}
            aria-label={`${it.name} (${g.label})`}
            title={gi === active ? undefined : `${it.name} · ${g.label}`}
            className={`tb-chip orbit-chip cursor-target ${gi === active ? "is-label" : "is-icon"}${it.id === selectedId ? " is-on" : ""}`}
            onClick={pick(it.id)}
          >
            <IconForTech name={it.name} size={gi === active ? 14 : 15} colored={false} />
            <span className="orbit-chip-label">{it.name}</span>
          </button>
        )),
      )}

      <div className="orbit-legend">
        {groups.map((g, gi) => (
          <button key={g.id} type="button" className={`orbit-legend-btn cursor-target${gi === active ? " is-on" : ""}`} onClick={() => onSelect(g.items[0].id)}>
            <span className="orbit-dot" />
            {g.label}
          </button>
        ))}
      </div>
      <span className="orbit-hint mono" aria-hidden="true">drag to spin · click a bubble to open its ring</span>
    </div>
  );
}
