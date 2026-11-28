import React, { useEffect, useRef } from "react";
import { usePointerFine } from "../hooks/usePointerFine";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useThemeMode } from "../hooks/useThemeMode";

/**
 * Custom cursor: a glowing dot with a short comet trail. It reacts to what's
 * underneath:
 *
 *   link / button  → dot swells and shows data-cursor-label in a pill
 *   stack-pit ball → dot swells with a "grab" label
 *   Bug Hunt arena → crosshair ticks
 *   text fields    → steps aside for the native text cursor
 *
 * Mouse and trackpad only; touch and reduced-motion keep the system cursor.
 */

const INTERACTIVE = "a, button, [role='button'], [role='tab'], [role='radio'], label, select, summary, .cursor-target, [data-cursor-label]";
// Only Bug Hunt gets a ring (its crosshair ticks); everywhere else it is just the dot and trail.
const SIZES = { default: 0, link: 0, grab: 0, aim: 40, text: 0, hidden: 0 };
const DOT_SCALE = { default: 1, link: 1.9, grab: 1.6, aim: 0.8, text: 0 };
const TRAIL_MS = 320;

function kindOf(el) {
  if (!el?.closest) return { kind: "default", label: "" };
  if (el.closest("input, textarea, [contenteditable='true']")) return { kind: "text", label: "" };
  if (el.closest(".pg-hunt")) return { kind: "aim", label: "" };
  if (el.closest(".pit-ball")) return { kind: "grab", label: "grab" };
  const t = el.closest(INTERACTIVE);
  if (t) return { kind: "link", label: t.getAttribute("data-cursor-label") || "" };
  return { kind: "default", label: "" };
}

function CursorLayer() {
  const mode = useThemeMode();
  const canvas = useRef(null);
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);
  const accent = useRef("#e8344a");

  useEffect(() => {
    accent.current = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#e8344a";
  }, [mode]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("custom-cursor");

    const cv = canvas.current;
    const ctx = cv.getContext("2d");
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const s = {
      mx: -100, my: -100, rx: -100, ry: -100,
      vx: 0, vy: 0, size: SIZES.default, stretch: 1, angle: 0,
      kind: "default", label: "", shown: 0, dot: 1, visible: false, down: false, pts: [], last: performance.now(),
    };

    const setKind = (k, text) => {
      if (k !== s.kind) {
        s.kind = k;
        ring.current.dataset.kind = k;
        dot.current.dataset.kind = k;
      }
      if (text !== s.label) {
        s.label = text;
        if (text) label.current.textContent = text;
      }
    };

    // The loop sleeps once everything has caught up with the pointer and the
    // trail has faded; any input wakes it. An idle cursor costs nothing.
    let raf = 0;
    let drewTrail = false;
    const wake = () => {
      if (raf) return;
      s.last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      wake();
      s.mx = e.clientX;
      s.my = e.clientY;
      if (!s.visible) {
        s.visible = true;
        s.rx = s.mx;
        s.ry = s.my;
      }
      s.pts.push({ x: s.mx, y: s.my, t: performance.now() });
      const { kind, label: text } = kindOf(e.target);
      setKind(kind, text);
    };
    const onDown = (e) => {
      wake();
      s.down = true;
      if (s.kind === "text") return;
      const r = document.createElement("span");
      r.className = "cursor-ripple";
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      canvas.current.parentNode.appendChild(r);
      r.animate([{ transform: "translate(-50%,-50%) scale(0.2)", opacity: 0.7 }, { transform: "translate(-50%,-50%) scale(1)", opacity: 0 }], {
        duration: 520,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      }).onfinish = () => r.remove();
    };
    const onUp = () => {
      wake();
      s.down = false;
    };
    const onLeave = () => {
      wake();
      s.visible = false;
    };
    const onScroll = () => {
      wake();
      // Content moves under a still pointer: re-check what's beneath it.
      const el = document.elementFromPoint(s.mx, s.my);
      const { kind, label: text } = kindOf(el);
      setKind(kind, text);
    };

    function tick(now) {
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      const k = 1 - Math.pow(0.0008, dt); // frame-rate independent follow
      const px = s.rx;
      const py = s.ry;
      s.rx += (s.mx - s.rx) * k;
      s.ry += (s.my - s.ry) * k;
      const vx = (s.rx - px) / (dt || 0.016);
      const vy = (s.ry - py) / (dt || 0.016);
      s.vx += (vx - s.vx) * 0.3;
      s.vy += (vy - s.vy) * 0.3;
      const speed = Math.hypot(s.vx, s.vy);

      const target = (SIZES[s.kind] ?? SIZES.default) * (s.down ? 0.78 : 1);
      s.size += (target - s.size) * Math.min(1, dt * 14);
      const wantStretch = s.kind === "default" ? 1 + Math.min(speed / 2600, 0.6) : 1;
      s.stretch += (wantStretch - s.stretch) * Math.min(1, dt * 12);
      if (speed > 30) s.angle = Math.atan2(s.vy, s.vx);
      s.shown += ((s.visible ? 1 : 0) - s.shown) * Math.min(1, dt * 10);

      const size = Math.max(0, s.size);
      const r = ring.current;
      r.style.width = r.style.height = `${size}px`;
      r.style.transform = `translate3d(${s.rx - size / 2}px, ${s.ry - size / 2}px, 0) rotate(${s.angle}rad) scale(${s.stretch}, ${1 / s.stretch})`;
      r.style.opacity = size < 1 ? "0" : s.shown.toFixed(3);
      s.dot += ((DOT_SCALE[s.kind] ?? 1) * (s.down ? 0.6 : 1) - s.dot) * Math.min(1, dt * 16);
      dot.current.style.transform = `translate3d(${s.mx}px, ${s.my}px, 0) translate(-50%, -50%) scale(${s.dot})`;
      dot.current.style.opacity = (s.kind === "text" ? 0 : s.shown).toFixed(3);

      const lab = label.current;
      const showLabel = s.label && s.kind !== "text" ? s.shown : 0;
      lab.style.opacity = showLabel.toFixed(3);
      lab.style.transform = `translate3d(${s.mx + 14}px, ${s.my + 12}px, 0) scale(${0.85 + showLabel * 0.15})`;

      // Comet trail: recent points drawn as a tapering, fading stroke. The
      // full-screen clear only happens while there is (or just was) a trail.
      s.pts = s.pts.filter((p) => now - p.t < TRAIL_MS);
      if (drewTrail) ctx.clearRect(0, 0, innerWidth, innerHeight);
      drewTrail = false;
      if (s.pts.length > 2 && s.kind !== "text" && s.visible) {
        drewTrail = true;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = accent.current;
        ctx.shadowColor = accent.current;
        ctx.shadowBlur = 10;
        for (let i = 1; i < s.pts.length; i++) {
          const a = s.pts[i - 1];
          const b = s.pts[i];
          const life = 1 - (now - b.t) / TRAIL_MS;
          ctx.globalAlpha = Math.max(0, life * 0.55);
          ctx.lineWidth = Math.max(0.5, life * 4.5);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      const settled =
        !drewTrail &&
        Math.abs(s.mx - s.rx) < 0.25 &&
        Math.abs(s.my - s.ry) < 0.25 &&
        Math.abs(target - s.size) < 0.2 &&
        Math.abs(wantStretch - s.stretch) < 0.004 &&
        Math.abs((s.visible ? 1 : 0) - s.shown) < 0.005;
      raf = settled ? 0 : requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <canvas ref={canvas} className="cursor-trail" />
      <div ref={ring} className="cursor-ring" data-kind="default">
        <span className="cursor-ticks" />
      </div>
      <div ref={dot} className="cursor-dot" data-kind="default" />
      <div ref={label} className="cursor-label" />
    </div>
  );
}

export function Cursor() {
  const fine = usePointerFine();
  const reduced = usePrefersReducedMotion();
  if (!fine || reduced) return null;
  return <CursorLayer />;
}
