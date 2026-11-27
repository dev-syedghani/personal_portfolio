import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCrosshair, FiGrid, FiPlay, FiRotateCcw, FiStar, FiTerminal, FiUploadCloud, FiZap } from "react-icons/fi";
import DecryptedText from "../../components/reactbits/DecryptedText";
import CountUp from "../../components/reactbits/CountUp";
import { IconForTech } from "../../components/Icons";
import { Reveal, SectionHead } from "../parts";
import { markPlayed, unlock } from "../achievements";

const EASE = [0.22, 1, 0.36, 1];
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Personal best per game, kept in this browser only. `lower` flips the
 * comparison for games where a smaller number wins (moves, time).
 * submit() returns true when the score is a new record.
 */
function useBest(key, { lower = false } = {}) {
  const read = () => {
    try {
      const v = localStorage.getItem(key);
      return v == null ? null : Number(v);
    } catch {
      return null;
    }
  };
  const [best, setBest] = useState(read);
  const ref = useRef(best);
  const submit = useCallback(
    (v) => {
      const prev = ref.current;
      const isNew = v > 0 && (prev == null || (lower ? v < prev : v > prev));
      if (isNew) {
        ref.current = v;
        setBest(v);
        try {
          localStorage.setItem(key, String(v));
        } catch {}
      }
      return isNew;
    },
    [key, lower]
  );
  return [best, submit];
}

/** The start / game-over card laid over a game's play area. */
function Overlay({ title, children, actionLabel, onAction, record }) {
  return (
    <motion.div
      className="pg-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="pg-overlay-card"
        initial={{ y: 16, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        {record && <span className="pg-record"><FiStar size={12} /> New personal best</span>}
        <h3 className="display pg-overlay-title">
          <DecryptedText text={title} animateOn="view" speed={35} maxIterations={12} sequential revealDirection="start" />
        </h3>
        {children}
        <button type="button" className="btn btn-primary cursor-target" data-cursor-label="play" onClick={onAction} style={{ marginTop: 22 }}>
          {actionLabel.startsWith("Play again") ? <FiRotateCcw /> : <FiPlay />}
          {actionLabel}
        </button>
      </motion.div>
    </motion.div>
  );
}

function Score({ value, suffix = "", label }) {
  return (
    <div className="pg-score">
      <span className="stat-num">
        <CountUp to={value} duration={1.1} suffix={suffix} />
      </span>
      <span>{label}</span>
    </div>
  );
}

const Best = ({ value, suffix = "" }) => (
  <p className="pg-best">{value == null ? "No best yet. Set one." : `Your best: ${value}${suffix}`}</p>
);

/* ── 1. Bug Hunt ─────────────────────────────────────────────────────────
   Bugs crawl in from the edges and wander. Squash as many as you can in 30s.
   Golden bugs are fast and worth 5; five hits in a row doubles every hit
   until you miss. */

const HUNT_SECONDS = 30;
const BUG = 40;

function BugIcon() {
  return (
    <svg viewBox="0 0 32 32" width={BUG} height={BUG} aria-hidden="true">
      <g className="pg-legs" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M10 13 4.5 10M9.5 18H3.5M10 23l-5 3.5M22 13l5.5-3M22.5 18h6M22 23l5 3.5M13.5 6.5l-2-3.5M18.5 6.5l2-3.5" />
      </g>
      <ellipse cx="16" cy="19" rx="7.2" ry="9" fill="currentColor" />
      <circle cx="16" cy="8.6" r="3.8" fill="currentColor" />
      <path d="M16 11v16.5" stroke="var(--bg0)" strokeWidth="1.3" opacity="0.7" />
    </svg>
  );
}

function spawnBug(w, h, elapsed) {
  const golden = Math.random() < 0.08;
  const edge = Math.floor(Math.random() * 4);
  const pad = BUG / 2;
  const x = edge === 0 ? pad : edge === 1 ? w - pad : rand(pad, w - pad);
  const y = edge === 2 ? pad : edge === 3 ? h - pad : rand(pad, h - pad);
  // Head roughly toward the middle so it doesn't immediately bounce off.
  const dir = Math.atan2(h / 2 - y, w / 2 - x) + rand(-0.6, 0.6);
  const speed = (70 + elapsed * 3.2) * (golden ? 1.9 : rand(0.85, 1.2));
  return { id: Math.random().toString(36).slice(2), x, y, dir, speed, turn: rand(0.3, 1), golden };
}

function BugHunt() {
  const arena = useRef(null);
  const bugs = useRef([]);
  const combo = useRef(0);
  const [phase, setPhase] = useState("idle");
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(HUNT_SECONDS);
  const [streak, setStreak] = useState(0);
  const [pops, setPops] = useState([]);
  const [record, setRecord] = useState(false);
  const [, frame] = useState(0);
  const [best, submit] = useBest("pg-bugs");
  const scoreRef = useRef(0);

  const start = () => {
    bugs.current = [];
    combo.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setPops([]);
    setLeft(HUNT_SECONDS);
    setRecord(false);
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const el = arena.current;
    const t0 = performance.now();
    let last = t0;
    let spawnIn = 0;
    let raf;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = (now - t0) / 1000;
      const w = el.clientWidth;
      const h = el.clientHeight;

      spawnIn -= dt;
      if (spawnIn <= 0 && bugs.current.length < 9) {
        bugs.current.push(spawnBug(w, h, elapsed));
        spawnIn = Math.max(0.32, 0.95 - elapsed * 0.022);
      }
      const pad = BUG / 2;
      for (const b of bugs.current) {
        b.turn -= dt;
        if (b.turn <= 0) {
          b.dir += rand(-1.1, 1.1);
          b.turn = rand(0.35, 1.1);
        }
        b.x += Math.cos(b.dir) * b.speed * dt;
        b.y += Math.sin(b.dir) * b.speed * dt;
        if (b.x < pad || b.x > w - pad) {
          b.dir = Math.PI - b.dir;
          b.x = clamp(b.x, pad, w - pad);
        }
        if (b.y < pad || b.y > h - pad) {
          b.dir = -b.dir;
          b.y = clamp(b.y, pad, h - pad);
        }
      }

      const remaining = Math.max(0, HUNT_SECONDS - elapsed);
      setLeft(Math.ceil(remaining));
      frame((n) => n + 1);
      if (remaining <= 0) {
        bugs.current = [];
        markPlayed("hunt");
        if (scoreRef.current >= 25) unlock("bugs");
        setRecord(submit(scoreRef.current));
        setPhase("over");
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, submit]);

  const pop = (x, y, text, kind) => {
    const id = Math.random().toString(36).slice(2);
    setPops((p) => [...p.slice(-10), { id, x, y, text, kind }]);
    setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 700);
  };

  const squash = (b) => (e) => {
    e.stopPropagation();
    bugs.current = bugs.current.filter((q) => q.id !== b.id);
    combo.current += 1;
    const mult = combo.current >= 5 ? 2 : 1;
    const pts = (b.golden ? 5 : 1) * mult;
    scoreRef.current += pts;
    setScore(scoreRef.current);
    setStreak(combo.current);
    pop(b.x, b.y, `+${pts}`, b.golden ? "gold" : "hit");
  };

  const miss = (e) => {
    if (phase !== "play") return;
    const r = arena.current.getBoundingClientRect();
    if (combo.current >= 5) pop(e.clientX - r.left, e.clientY - r.top, "combo lost", "miss");
    combo.current = 0;
    setStreak(0);
  };

  return (
    <div className="pg-game">
      <div className="pg-hud">
        <span>Score <b>{score}</b></span>
        <span className={streak >= 5 ? "pg-hot" : ""}>{streak >= 5 ? <><FiZap size={12} /> x2 combo · {streak}</> : `Combo ${streak}`}</span>
        <span>
          <b>{left}</b>s left
        </span>
      </div>
      <div ref={arena} className="pg-arena pg-hunt" onPointerDown={miss}>
        <div className="pg-timebar" style={{ transform: `scaleX(${left / HUNT_SECONDS})` }} />
        {bugs.current.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-label={b.golden ? "Golden bug" : "Bug"}
            className={`pg-bug${b.golden ? " is-gold" : ""}`}
            onPointerDown={squash(b)}
            style={{ transform: `translate(${b.x - BUG / 2}px, ${b.y - BUG / 2}px) rotate(${b.dir + Math.PI / 2}rad)` }}
          >
            <BugIcon />
          </button>
        ))}
        <AnimatePresence>
          {pops.map((p) => (
            <motion.span
              key={p.id}
              className={`pg-pop is-${p.kind}`}
              style={{ left: p.x, top: p.y }}
              initial={{ opacity: 1, y: 0, scale: 0.6 }}
              animate={{ opacity: 0, y: -34, scale: 1.1 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              {p.text}
            </motion.span>
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {phase === "idle" && (
            <Overlay title="Bug Hunt" actionLabel="Start hunting" onAction={start}>
              <p className="pg-copy">Production is crawling with bugs. Squash as many as you can in 30 seconds. Golden ones are worth 5, and five hits in a row doubles your points.</p>
              <Best value={best} />
            </Overlay>
          )}
          {phase === "over" && (
            <Overlay title={score >= 40 ? "Zero bugs in prod" : score >= 20 ? "Solid hotfix" : "Ship it anyway?"} actionLabel="Play again" onAction={start} record={record}>
              <Score value={score} label="bugs squashed (points)" />
              <Best value={best} />
            </Overlay>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── 2. Deploy or Die ────────────────────────────────────────────────────
   A marker sweeps across the pipeline. Press when it's inside the green
   window to ship. Each release speeds it up and narrows the window. */

const STAGES = ["build", "lint", "test", "migrate", "deploy"];

function zoneFor(level) {
  const width = Math.max(0.055, 0.24 - level * 0.016);
  return { start: rand(0.04, 0.96 - width), width };
}

function DeployOrDie() {
  const marker = useRef(null);
  const zoneEl = useRef(null);
  const trackEl = useRef(null);
  const pos = useRef(0);
  const dir = useRef(1);
  const [phase, setPhase] = useState("idle");
  const [level, setLevel] = useState(0);
  const [zone, setZone] = useState(() => zoneFor(0));
  const [log, setLog] = useState([]);
  const [flash, setFlash] = useState(null);
  const [record, setRecord] = useState(false);
  const [best, submit] = useBest("pg-deploy");
  const state = useRef({ phase, level, zone });
  state.current = { phase, level, zone };

  const start = () => {
    pos.current = 0;
    dir.current = 1;
    setLevel(0);
    setZone(zoneFor(0));
    setLog(["$ git push origin main", "→ pipeline started"]);
    setRecord(false);
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    let last = performance.now();
    let raf;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const speed = 0.55 + state.current.level * 0.11;
      pos.current += dir.current * speed * dt;
      if (pos.current > 1) {
        pos.current = 2 - pos.current;
        dir.current = -1;
      } else if (pos.current < 0) {
        pos.current = -pos.current;
        dir.current = 1;
      }
      if (marker.current) marker.current.style.left = `${pos.current * 100}%`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const deploy = useCallback(() => {
    const { phase: ph, level: lv, zone: z } = state.current;
    if (ph !== "play") return;
    const p = pos.current;
    const stage = STAGES[lv % STAGES.length];
    // Judge against the window as drawn, so a press while it's still sliding
    // into place matches what the player sees.
    let lo = z.start;
    let hi = z.start + z.width;
    const t = trackEl.current?.getBoundingClientRect();
    const zr = zoneEl.current?.getBoundingClientRect();
    if (t?.width && zr) {
      lo = (zr.left - t.left) / t.width;
      hi = (zr.right - t.left) / t.width;
    }
    if (p >= lo && p <= hi) {
      const next = lv + 1;
      setLevel(next);
      setZone(zoneFor(next));
      setLog((l) => [...l.slice(-5), `✓ ${stage} passed · v1.${next}.0 is live`]);
      setFlash("ok");
    } else {
      setLog((l) => [...l.slice(-5), `✗ ${stage} failed · rolling back v1.${lv + 1}.0`]);
      setFlash("fail");
      markPlayed("deploy");
      if (lv >= 5) unlock("deploy");
      setRecord(submit(lv));
      setPhase("over");
    }
    setTimeout(() => setFlash(null), 320);
  }, [submit]);

  // Space / Enter ship while a round is running (and only then, so the page
  // still scrolls normally the rest of the time).
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e) => {
      if (e.code !== "Space" && e.key !== "Enter") return;
      e.preventDefault();
      deploy();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, deploy]);

  return (
    <div className="pg-game">
      <div className="pg-hud">
        <span>Releases <b>{level}</b></span>
        <span>Stage <b>{STAGES[level % STAGES.length]}</b></span>
        <span>Speed <b>{(1 + level * 0.2).toFixed(1)}×</b></span>
      </div>
      <div className={`pg-arena pg-deploy${flash ? ` is-${flash}` : ""}`}>
        <div className="pg-stages">
          {STAGES.map((s, i) => (
            <span key={s} className={i === level % STAGES.length && phase === "play" ? "is-on" : ""}>{s}</span>
          ))}
        </div>
        <div ref={trackEl} className="pg-track" onPointerDown={deploy}>
          <motion.div
            ref={zoneEl}
            className="pg-zone"
            animate={{ left: `${zone.start * 100}%`, width: `${zone.width * 100}%` }}
            transition={{ duration: 0.2, ease: EASE }}
          />
          <div ref={marker} className="pg-marker" />
        </div>
        <button type="button" className="btn btn-primary pg-ship cursor-target" data-cursor-label="ship it" onClick={deploy} disabled={phase !== "play"}>
          <FiUploadCloud /> Deploy <kbd>space</kbd>
        </button>
        <div className="pg-log mono" aria-live="polite">
          {log.map((l, i) => (
            <div key={i + l} className={l.startsWith("✓") ? "ok" : l.startsWith("✗") ? "fail" : ""}>{l}</div>
          ))}
        </div>
        <AnimatePresence>
          {phase === "idle" && (
            <Overlay title="Deploy or Die" actionLabel="Push to main" onAction={start}>
              <p className="pg-copy">Hit Deploy (or Space) while the marker is inside the green window. Every release speeds it up and narrows the window. One miss and it rolls back.</p>
              <Best value={best} suffix=" releases" />
            </Overlay>
          )}
          {phase === "over" && (
            <Overlay title={level >= 12 ? "Staff engineer energy" : level >= 6 ? "Shipped on a Friday" : "Rolled back"} actionLabel="Play again" onAction={start} record={record}>
              <Score value={level} label="successful releases" />
              <Best value={best} suffix=" releases" />
            </Overlay>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── 3. Type the Stack ───────────────────────────────────────────────────
   30 seconds of typing real commands and snippets. Scored in WPM, counting
   correct characters only. */

const TYPE_SECONDS = 30;
const SNIPPETS = [
  "rails g model Payment amount:decimal",
  "git push origin main",
  "const [user, setUser] = useState(null)",
  "bundle exec rspec",
  "Stripe::PaymentIntent.create(amount: 500)",
  "SELECT * FROM users WHERE active = true;",
  "docker compose up -d",
  "useEffect(() => {}, [])",
  "rails db:migrate",
  "export default function App() {}",
  "npm run build",
  "redis-cli PING",
  "has_many :subscriptions, dependent: :destroy",
  "git commit -m \"fix: it works now\"",
  "await fetch('/api/orders')",
];

function TypeTheStack() {
  const input = useRef(null);
  const order = useRef([]);
  const [phase, setPhase] = useState("idle");
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(0);
  const [errors, setErrors] = useState(0);
  const [left, setLeft] = useState(TYPE_SECONDS);
  const [record, setRecord] = useState(false);
  const [best, submit] = useBest("pg-type");
  const typed = useRef(0);

  const target = order.current[idx] ?? SNIPPETS[0];
  const wpm = Math.round(correct / 5 / ((TYPE_SECONDS - left || 1) / 60));

  const start = () => {
    order.current = [...SNIPPETS].sort(() => Math.random() - 0.5);
    typed.current = 0;
    setIdx(0);
    setValue("");
    setCorrect(0);
    setDone(0);
    setErrors(0);
    setLeft(TYPE_SECONDS);
    setRecord(false);
    setPhase("play");
    requestAnimationFrame(() => input.current?.focus());
  };

  useEffect(() => {
    if (phase !== "play") return;
    const t0 = performance.now();
    const id = setInterval(() => {
      const remaining = Math.max(0, TYPE_SECONDS - (performance.now() - t0) / 1000);
      setLeft(Math.ceil(remaining));
      if (remaining <= 0) {
        clearInterval(id);
        const final = Math.round(typed.current / 5 / (TYPE_SECONDS / 60));
        markPlayed("type");
        if (final >= 40) unlock("wpm");
        setRecord(submit(final));
        setPhase("over");
        input.current?.blur();
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, submit]);

  const onChange = (e) => {
    if (phase !== "play") return;
    const v = e.target.value;
    // Count a correct keystroke only when the newest character matches.
    if (v.length > value.length) {
      const i = v.length - 1;
      if (v[i] === target[i] && v.slice(0, i) === target.slice(0, i)) {
        typed.current += 1;
        setCorrect(typed.current);
      } else {
        setErrors((n) => n + 1);
      }
    }
    if (v === target) {
      setDone((n) => n + 1);
      setIdx((n) => (n + 1) % order.current.length);
      setValue("");
      return;
    }
    setValue(v);
  };

  return (
    <div className="pg-game">
      <div className="pg-hud">
        <span><b>{phase === "play" ? wpm : 0}</b> wpm</span>
        <span>Snippets <b>{done}</b> · Typos <b>{errors}</b></span>
        <span><b>{left}</b>s left</span>
      </div>
      <div className="pg-arena pg-typing" onPointerDown={() => phase === "play" && setTimeout(() => input.current?.focus())}>
        <div className="pg-timebar" style={{ transform: `scaleX(${left / TYPE_SECONDS})` }} />
        <div className="pg-prompt mono">
          <span className="pg-caret-sign">$</span>
          <span>
            {target.split("").map((ch, i) => {
              const typedCh = value[i];
              const cls = typedCh == null ? (i === value.length ? "cur" : "") : typedCh === ch ? "ok" : "bad";
              return (
                <span key={i} className={cls}>{ch === " " ? " " : ch}</span>
              );
            })}
          </span>
        </div>
        <div className="pg-next mono">next: {order.current[(idx + 1) % (order.current.length || 1)] ?? "…"}</div>
        <input
          ref={input}
          className="pg-hidden-input"
          value={value}
          onChange={onChange}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Type the snippet shown"
          disabled={phase !== "play"}
        />
        <AnimatePresence>
          {phase === "idle" && (
            <Overlay title="Type the Stack" actionLabel="Start typing" onAction={start}>
              <p className="pg-copy">Thirty seconds, real commands from my day job. Type each snippet exactly. Only correct characters count toward your WPM.</p>
              <Best value={best} suffix=" wpm" />
            </Overlay>
          )}
          {phase === "over" && (
            <Overlay
              title={Math.round(correct / 5 / (TYPE_SECONDS / 60)) >= 60 ? "10x engineer" : Math.round(correct / 5 / (TYPE_SECONDS / 60)) >= 35 ? "Pairing-ready" : "Copilot can help"}
              actionLabel="Play again"
              onAction={start}
              record={record}
            >
              <Score value={Math.round(correct / 5 / (TYPE_SECONDS / 60))} label={`wpm · ${done} snippets · ${errors} typos`} />
              <Best value={best} suffix=" wpm" />
            </Overlay>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── 4. Stack Match ──────────────────────────────────────────────────────
   Classic pairs, using the tools I actually ship with. Fewest moves wins. */

const DECK = ["React", "Next.js", "Ruby on Rails", "PostgreSQL", "Redis", "Tailwind CSS"];
const shuffle = () => [...DECK, ...DECK].map((name, i) => ({ id: i, name })).sort(() => Math.random() - 0.5);

function StackMatch() {
  const [cards, setCards] = useState(shuffle);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [record, setRecord] = useState(false);
  const [secs, setSecs] = useState(0);
  const [best, submit] = useBest("pg-match", { lower: true });
  const lock = useRef(false);

  const start = () => {
    setCards(shuffle());
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setSecs(0);
    setRecord(false);
    lock.current = false;
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const flip = (i) => {
    if (phase !== "play" || lock.current || open.includes(i) || matched.has(cards[i].name)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    const m = moves + 1;
    setMoves(m);
    const [a, b] = next;
    if (cards[a].name === cards[b].name) {
      const nm = new Set(matched).add(cards[a].name);
      setMatched(nm);
      setOpen([]);
      if (nm.size === DECK.length) {
        markPlayed("match");
        if (m <= 9) unlock("match");
        setRecord(submit(m));
        setTimeout(() => setPhase("over"), 650);
      }
    } else {
      lock.current = true;
      setTimeout(() => {
        setOpen([]);
        lock.current = false;
      }, 750);
    }
  };

  return (
    <div className="pg-game">
      <div className="pg-hud">
        <span>Moves <b>{moves}</b></span>
        <span>Pairs <b>{matched.size}</b>/{DECK.length}</span>
        <span><b>{secs}</b>s</span>
      </div>
      <div className="pg-arena pg-match">
        <div className="pg-cards">
          {cards.map((c, i) => {
            const up = open.includes(i) || matched.has(c.name);
            return (
              <button
                key={c.id}
                type="button"
                className={`pg-card${matched.has(c.name) ? " is-matched" : ""}`}
                onClick={() => flip(i)}
                aria-label={up ? c.name : "Hidden card"}
              >
                <motion.span
                  className="pg-card-inner"
                  animate={{ rotateY: up ? 180 : 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <span className="pg-face pg-back mono">{"</>"}</span>
                  <span className="pg-face pg-front">
                    <IconForTech name={c.name} size={30} colored />
                    <small>{c.name}</small>
                  </span>
                </motion.span>
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {phase === "idle" && (
            <Overlay title="Stack Match" actionLabel="Deal the cards" onAction={start}>
              <p className="pg-copy">Find the six pairs from the stack I ship with. Fewer moves is better. Perfect memory is six.</p>
              <Best value={best} suffix=" moves" />
            </Overlay>
          )}
          {phase === "over" && (
            <Overlay title={moves <= 9 ? "Photographic memory" : moves <= 14 ? "Nicely matched" : "All pairs found"} actionLabel="Play again" onAction={start} record={record}>
              <Score value={moves} label={`moves · ${secs}s`} />
              <Best value={best} suffix=" moves" />
            </Overlay>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const GAMES = [
  { id: "hunt", name: "Bug Hunt", hint: "click", icon: FiCrosshair, C: BugHunt },
  { id: "deploy", name: "Deploy or Die", hint: "timing", icon: FiUploadCloud, C: DeployOrDie },
  { id: "type", name: "Type the Stack", hint: "typing", icon: FiTerminal, C: TypeTheStack },
  { id: "match", name: "Stack Match", hint: "memory", icon: FiGrid, C: StackMatch },
];

export function Playground() {
  const [active, setActive] = useState(GAMES[0].id);
  const game = GAMES.find((g) => g.id === active);

  // The terminal's play command picks a game from outside.
  useEffect(() => {
    const on = (e) => GAMES.some((g) => g.id === e.detail) && setActive(e.detail);
    window.addEventListener("rm:play", on);
    return () => window.removeEventListener("rm:play", on);
  }, []);

  return (
    <section className="sec" id="games">
      <div className="wrap">
        <SectionHead
          eyebrow="Playground"
          title="Take a break,"
          accent="play something."
          lead="Four tiny games I built in React. Your best scores stay in this browser, so come back and beat them."
        />
        <Reveal>
          <div className="pg-tabs" role="tablist" aria-label="Games">
            {GAMES.map((g) => {
              const Icon = g.icon;
              const on = g.id === active;
              return (
                <button
                  key={g.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={`pg-tab cursor-target${on ? " is-on" : ""}`}
                  data-cursor-label={g.hint}
                  onClick={() => setActive(g.id)}
                >
                  {on && <motion.span layoutId="pg-tab-bg" className="pg-tab-bg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <Icon size={15} />
                  <span>{g.name}</span>
                </button>
              );
            })}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="pg-shell" role="tabpanel" aria-label={game.name}>
            <AnimatePresence mode="wait">
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <game.C />
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
