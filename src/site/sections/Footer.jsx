import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import { FiArrowUp } from "react-icons/fi";
import resumeData from "../../utils/resumeData";
import { IconForTech } from "../../components/Icons";
import { useThemeMode } from "../../hooks/useThemeMode";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/* The footer is a little toy box: my stack as physics balls you can push,
   grab and throw, plus "Bit", a small robot that follows the pointer and
   explains whatever you're touching. */

const BALLS = [
  { name: "Ruby on Rails", line: "My backend of choice. Rails 6, 7 and 8 in production." },
  { name: "React", line: "My main frontend tool — CinnaLab's whole multi-tenant UI runs on it." },
  { name: "PostgreSQL", line: "The database under most of my SaaS builds." },
  { name: "Sidekiq", line: "Background jobs, retry queues and dead-letter handling." },
  { name: "ActionCable", line: "WebSockets for real-time notifications, no polling." },
  { name: "Hotwire", line: "Turbo Drive, Frames and Streams — HTML over the wire." },
  { name: "Redis", line: "Caching, plus the queue behind background jobs." },
  { name: "Stripe", line: "Subscriptions, idempotent webhooks and billing flows." },
  { name: "Devise", line: "Authentication, paired with Pundit for role-based access." },
  { name: "Tailwind CSS", line: "Utility-first styling. Fast to ship, easy to keep tidy." },
  { name: "Docker", line: "The same environment from laptop to production." },
  { name: "AWS", line: "EC2, RDS and S3 for hosting and storage." },
  { name: "GitHub Actions", icon: "actions", line: "CI/CD. It also rebuilds this site every six hours." },
  { name: "RSpec", line: "Tests for the Rails side of things." },
  { name: "Vite", line: "The build tool behind this very site." },
];

const TIPS = [
  "Hi, I'm Bit! Push the balls around.",
  "Grab a ball and throw it. Go on.",
  typeof window !== "undefined" && window.matchMedia("(hover: none)").matches ? "Tap a ball and I'll tell you about it." : "Hover a ball and I'll tell you about it.",
  "Psst, press ` for a hidden terminal.",
];

const GRAVITY = 1900;
const BOUNCE = 0.5;
const rand = (a, b) => a + Math.random() * (b - a);

/** Runs the ball physics and reports which ball is under the pointer. */
function usePit(pitRef, ballRefs, { onHover, onThrow, reduced }) {
  const sim = useRef(null);

  useEffect(() => {
    const pit = pitRef.current;
    if (!pit) return;
    let W = pit.clientWidth;
    let H = pit.clientHeight;
    const unit = () => Math.max(24, Math.min(36, W / 14));
    const radius = (i) => unit() * (0.85 + (i % 3) * 0.17);
    const balls = BALLS.map((b, i) => {
      const r = radius(i);
      return { ...b, r, x: rand(r, W - r), y: reduced ? H - r - (i % 2) * r * 2 : -rand(60, 900), vx: rand(-80, 80), vy: 0, a: rand(-0.4, 0.4) };
    });
    const p = { x: -999, y: -999, vx: 0, vy: 0, inside: false, t: 0 };
    let drag = null;
    let hovered = null;
    let raf = 0;
    let visible = false;
    let last = 0;

    const render = () => {
      balls.forEach((b, i) => {
        const el = ballRefs.current[i];
        if (el) el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) rotate(${b.a}rad)`;
      });
    };

    const step = (dt) => {
      for (const b of balls) {
        if (b === drag) {
          b.vx = p.vx;
          b.vy = p.vy;
          b.x = p.x;
          b.y = p.y;
          continue;
        }
        b.vy += GRAVITY * dt;
        b.vx *= 0.999;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.a += (b.vx * dt) / b.r;
        if (b.x < b.r) { b.x = b.r; b.vx = -b.vx * BOUNCE; }
        if (b.x > W - b.r) { b.x = W - b.r; b.vx = -b.vx * BOUNCE; }
        if (b.y > H - b.r) {
          b.y = H - b.r;
          b.vy = Math.abs(b.vy) < 40 ? 0 : -b.vy * BOUNCE;
          b.vx *= 0.97;
        }
        if (b.y < -1200) b.y = -1200;

        // A moving pointer shoves balls out of its way; a still one can rest
        // on a ball so Bit can explain it.
        if (p.inside && !drag && Math.hypot(p.vx, p.vy) > 160) {
          const dx = b.x - p.x;
          const dy = b.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          const min = b.r + 18;
          if (d < min) {
            const nx = dx / d;
            const ny = dy / d;
            const push = min - d;
            b.x += nx * push;
            b.y += ny * push;
            b.vx += nx * push * 16 + p.vx * 0.2;
            b.vy += ny * push * 16 + p.vy * 0.2;
          }
        }
      }
      // Ball-to-ball: push apart, then exchange momentum along the contact normal.
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy);
          const min = a.r + b.r;
          if (d >= min || d === 0) continue;
          const nx = dx / d;
          const ny = dy / d;
          const ma = a === drag ? 1e6 : a.r * a.r;
          const mb = b === drag ? 1e6 : b.r * b.r;
          const overlap = min - d;
          a.x -= nx * overlap * (mb / (ma + mb));
          a.y -= ny * overlap * (mb / (ma + mb));
          b.x += nx * overlap * (ma / (ma + mb));
          b.y += ny * overlap * (ma / (ma + mb));
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            const imp = (-(1 + BOUNCE) * rv) / (1 / ma + 1 / mb);
            a.vx -= (imp / ma) * nx;
            a.vy -= (imp / ma) * ny;
            b.vx += (imp / mb) * nx;
            b.vy += (imp / mb) * ny;
          }
        }
      }
    };

    const tick = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
      last = now;
      p.vx *= 0.82; // pointer speed fades once the mouse stops moving
      p.vy *= 0.82;
      step(dt / 2);
      step(dt / 2);
      render();
      // Which ball is the pointer over? Only report changes.
      let over = null;
      if (p.inside) for (const b of balls) if (Math.hypot(b.x - p.x, b.y - p.y) < b.r) over = b;
      if (drag) over = drag;
      if (over !== hovered) {
        hovered = over;
        onHover.current(over);
      }
      if (visible) raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf || reduced || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const size = () =>
      balls.forEach((b, i) => {
        const el = ballRefs.current[i];
        if (el) el.style.width = el.style.height = `${b.r * 2}px`;
      });
    size();
    render();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(pit);
    const ro = new ResizeObserver(() => {
      W = pit.clientWidth;
      H = pit.clientHeight;
      balls.forEach((b, i) => {
        b.r = radius(i);
        b.x = Math.min(Math.max(b.x, b.r), W - b.r);
        b.y = Math.min(b.y, H - b.r);
      });
      size();
      render();
      start();
    });
    ro.observe(pit);

    sim.current = {
      move(x, y, inside) {
        const now = performance.now();
        const dt = Math.max(0.008, (now - p.t) / 1000);
        if (p.inside && inside) {
          p.vx = p.vx * 0.5 + ((x - p.x) / dt) * 0.5;
          p.vy = p.vy * 0.5 + ((y - p.y) / dt) * 0.5;
        } else {
          p.vx = 0;
          p.vy = 0;
        }
        p.x = x;
        p.y = y;
        p.t = now;
        p.inside = inside;
      },
      grab(i) {
        drag = balls[i];
      },
      release() {
        if (!drag) return;
        const speed = Math.hypot(drag.vx, drag.vy);
        drag.vx = Math.max(-2600, Math.min(2600, drag.vx));
        drag.vy = Math.max(-2600, Math.min(2600, drag.vy));
        drag = null;
        onThrow.current(speed);
      },
      get dragging() {
        return !!drag;
      },
    };

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, [pitRef, ballRefs, onHover, onThrow, reduced]);

  return sim;
}

/** Bit: a tiny robot. Eyes track the pointer; it blinks now and then. */
function Bit({ look, talking }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let t;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, rand(2200, 4800));
    };
    loop();
    return () => clearTimeout(t);
  }, []);
  const px = useTransform(look.x, (v) => v * 2.4);
  const py = useTransform(look.y, (v) => v * 2.4);
  return (
    <svg viewBox="0 0 64 72" width="56" height="63" aria-hidden="true" className="bit-svg">
      <defs>
        <linearGradient id="bit-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7b7" />
          <stop offset="0.6" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <line x1="32" y1="14" x2="32" y2="5" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
      <circle className="bit-bulb" cx="32" cy="5" r="4" fill={talking ? "#fbbf24" : "#6ee7b7"} />
      <rect x="6" y="14" width="52" height="44" rx="15" fill="url(#bit-g)" />
      <rect x="6" y="14" width="52" height="22" rx="15" fill="#fff" opacity="0.18" />
      <rect x="14" y="24" width="36" height="22" rx="10" fill="#04140d" />
      <motion.g style={{ x: px, y: py }}>
        <motion.g animate={{ scaleY: blink ? 0.1 : 1 }} transition={{ duration: 0.08 }} style={{ transformOrigin: "32px 35px" }}>
          <circle cx="24" cy="35" r="4.2" fill="#6ee7b7" />
          <circle cx="40" cy="35" r="4.2" fill="#6ee7b7" />
        </motion.g>
      </motion.g>
      <path d={talking ? "M27 50 q5 5 10 0" : "M28 51 q4 2.5 8 0"} stroke="#04140d" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <rect x="20" y="58" width="24" height="8" rx="4" fill="#059669" />
    </svg>
  );
}

export function Footer() {
  useThemeMode(); // monochrome logos repaint with the theme
  const reduced = usePrefersReducedMotion();
  const footerRef = useRef(null);
  const pitRef = useRef(null);
  const ballRefs = useRef([]);
  const [hover, setHover] = useState(null);
  const [say, setSay] = useState(TIPS[0]);
  const [mode, setMode] = useState("home"); // home | follow
  const ctx = useRef({ ball: null, ui: null, until: 0 });

  // Bit's position springs after a target; its tilt follows its own speed.
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, { stiffness: 140, damping: 16, mass: 0.9 });
  const y = useSpring(ty, { stiffness: 140, damping: 16, mass: 0.9 });
  const vx = useVelocity(x);
  const tilt = useTransform(vx, [-1400, 1400], [-18, 18], { clamp: true });
  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const [side, setSide] = useState("left");

  const home = () => {
    const f = footerRef.current;
    if (!f) return;
    tx.set(f.clientWidth - (f.clientWidth < 640 ? 76 : 120));
    ty.set(f.clientHeight - (f.clientWidth < 640 ? 200 : 210));
  };

  const speak = (text, hold = 0) => {
    setSay(text);
    ctx.current.until = hold ? performance.now() + hold : 0;
  };

  const onHover = useRef(() => {});
  onHover.current = (ball) => {
    ctx.current.ball = ball;
    setHover(ball?.name ?? null);
    if (performance.now() < ctx.current.until) return;
    if (ball) speak(`${ball.name}: ${ball.line}`);
  };
  const onThrow = useRef(() => {});
  onThrow.current = (speed) => speak(speed > 1500 ? "Yeet! Nice arm." : speed > 600 ? "Wheee!" : "Gently does it.", 1600);

  const sim = usePit(pitRef, ballRefs, { onHover, onThrow, reduced });

  useEffect(() => {
    if (mode === "home") home();
    const onResize = () => mode === "home" && home();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Rotate idle tips while nothing more interesting is going on.
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const c = ctx.current;
      if (c.ball || c.ui || performance.now() < c.until || sim.current?.dragging) return;
      i = (i + 1) % TIPS.length;
      setSay(TIPS[i]);
    }, 4200);
    return () => clearInterval(id);
  }, [sim]);

  const onMove = (e) => {
    const f = footerRef.current.getBoundingClientRect();
    const fx = e.clientX - f.left;
    const fy = e.clientY - f.top;
    if (e.pointerType === "mouse" && !reduced) {
      setMode("follow");
      tx.set(Math.min(fx + 30, f.width - 60));
      ty.set(Math.max(fy - 20, 10));
      setSide(fx > f.width - 300 ? "left" : "right");
    }
    // Eyes look toward the pointer from wherever Bit currently is.
    const dx = fx - (x.get() + 28);
    const dy = fy - (y.get() + 36);
    const d = Math.hypot(dx, dy) || 1;
    lookX.set((dx / d) * Math.min(1, d / 80));
    lookY.set((dy / d) * Math.min(1, d / 80));

    const pit = pitRef.current.getBoundingClientRect();
    const px = e.clientX - pit.left;
    const py = e.clientY - pit.top;
    sim.current?.move(px, py, px >= 0 && py >= 0 && px <= pit.width && py <= pit.height);
  };

  const onLeave = () => {
    sim.current?.move(-999, -999, false);
    sim.current?.release();
    ctx.current.ui = null;
    setMode("home");
    setSide("left");
    home();
    lookX.set(-0.6);
    lookY.set(0.2);
  };

  const uiHover = (text) => ({
    onPointerEnter: () => {
      ctx.current.ui = text;
      speak(text);
    },
    onPointerLeave: () => {
      ctx.current.ui = null;
    },
  });

  const grab = (i) => (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onMove(e);
    sim.current?.grab(i);
    // Touch has no hover, so a tap is how you ask Bit about a ball.
    if (e.pointerType === "mouse") speak(`Got ${BALLS[i].name}! Now throw it.`, 99999);
    else speak(`${BALLS[i].name}: ${BALLS[i].line}`, 2600);
  };
  const release = () => {
    if (sim.current?.dragging) sim.current.release();
  };

  return (
    <footer ref={footerRef} className="site-footer" onPointerMove={onMove} onPointerLeave={onLeave} onPointerUp={release} onPointerCancel={release}>
      <div className="wrap footer-top">
        <span className="mono footer-meta">
          © {new Date().getFullYear()} {resumeData.name} · built with React, Framer Motion & React Bits ·{" "}
          <button type="button" className="footer-secret cursor-target" data-cursor-label="psst" onClick={() => window.dispatchEvent(new Event("rm:terminal"))} {...uiHover("Ooh, a secret terminal. Click it!")}>
            psst, press <kbd>`</kbd>
          </button>
        </span>
        <a href="#top" className="btn btn-ghost cursor-target" data-cursor-label="up!" style={{ height: 42, fontSize: 13 }} {...uiHover("Back to the top? Beam me up!")}>
          Back to top <FiArrowUp />
        </a>
      </div>

      <div className="pit-caption mono">
        <span className="live-dot" /> the stack pit · push, grab and throw
      </div>

      <div ref={pitRef} className="pit">
        <div className="footer-name" aria-hidden="true">{resumeData.name.toUpperCase()}</div>
        {BALLS.map((b, i) => (
          <div
            key={b.name}
            ref={(el) => (ballRefs.current[i] = el)}
            className={`pit-ball${hover === b.name ? " is-hover" : ""}`}
            onPointerDown={grab(i)}
            role="img"
            aria-label={b.name}
          >
            <span className="pit-ball-inner">
              <IconForTech name={b.icon ?? b.name} size={22} colored />
            </span>
          </div>
        ))}
      </div>

      <motion.div className={`bit is-${mode}`} style={{ x, y, rotate: tilt }} aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={say}
            className={`bit-bubble is-${side}`}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            {say}
          </motion.div>
        </AnimatePresence>
        <motion.div animate={reduced ? {} : { y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <Bit look={{ x: lookX, y: lookY }} talking={!!hover || mode === "follow"} />
        </motion.div>
      </motion.div>
    </footer>
  );
}

