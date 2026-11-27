import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAward, FiCommand, FiCrosshair, FiFlag, FiGrid, FiLock, FiMail, FiPlay, FiSearch, FiSlash, FiSun, FiTerminal, FiUploadCloud, FiUserCheck, FiX, FiZap } from "react-icons/fi";

/**
 * A tiny achievements system. Anything on the page can call unlock(id); the
 * set lives in localStorage so progress survives reloads, and a window event
 * lets the toast and the trophy panel update without a context provider.
 */
export const ACHIEVEMENTS = [
  { id: "terminal", icon: FiTerminal, title: "Root access", hint: "Find the hidden terminal" },
  { id: "sudo", icon: FiSlash, title: "Nice try", hint: "Ask the terminal for superpowers" },
  { id: "konami", icon: FiCommand, title: "Old school", hint: "↑ ↑ ↓ ↓ ← → ← → …" },
  { id: "theme", icon: FiSun, title: "Light switch", hint: "Can't decide on a theme" },
  { id: "curious", icon: FiSearch, title: "Curious mind", hint: "Open three project write-ups" },
  { id: "hire", icon: FiUserCheck, title: "Persistent", hint: "Catch the Hire me button" },
  { id: "hello", icon: FiMail, title: "Hello there", hint: "Send me a message" },
  { id: "bottom", icon: FiFlag, title: "The whole story", hint: "Reach the very bottom" },
  { id: "bugs", icon: FiCrosshair, title: "Exterminator", hint: "Score 25+ in Bug Hunt" },
  { id: "deploy", icon: FiUploadCloud, title: "Ship it", hint: "5 releases in Deploy or Die" },
  { id: "wpm", icon: FiZap, title: "Keyboard warrior", hint: "40+ wpm in Type the Stack" },
  { id: "match", icon: FiGrid, title: "Total recall", hint: "Stack Match in 9 moves or fewer" },
  { id: "arcade", icon: FiPlay, title: "Arcade regular", hint: "Play all four games" },
];

const KEY = "rm-achievements";
const EVENT = "rm:achievement";

function load() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();
  }
}
let unlocked = load();

export function unlock(id) {
  if (unlocked.has(id) || !ACHIEVEMENTS.some((a) => a.id === id)) return;
  unlocked = new Set(unlocked).add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...unlocked]));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
}

export function resetAchievements() {
  unlocked = new Set();
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem("rm-played");
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }));
}

/** Records that a game was played; all four unlocks "arcade". */
export function markPlayed(game) {
  let played = [];
  try {
    played = JSON.parse(localStorage.getItem("rm-played") || "[]");
  } catch {}
  if (!played.includes(game)) played.push(game);
  try {
    localStorage.setItem("rm-played", JSON.stringify(played));
  } catch {}
  if (played.length >= 4) unlock("arcade");
}

export function useAchievements() {
  const [set, setSet] = useState(unlocked);
  useEffect(() => {
    const on = () => setSet(unlocked);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return set;
}

/** Slides a card up from the bottom for each new unlock, one at a time. */
export function AchievementToasts() {
  const [queue, setQueue] = useState([]);
  useEffect(() => {
    const on = (e) => {
      const a = ACHIEVEMENTS.find((x) => x.id === e.detail);
      if (a) setQueue((q) => [...q, a]);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  const current = queue[0];
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 3400);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <div className="ach-toast-host" aria-live="polite">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            className="ach-toast"
            initial={{ y: 40, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <span className="ach-icon"><current.icon size={20} /></span>
            <span>
              <span className="ach-kicker">Achievement unlocked</span>
              <b>{current.title}</b>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Trophy pill in the top bar; opens a panel with every achievement. */
export function TrophyButton() {
  const got = useAchievements();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  // A little bounce on the pill whenever something new unlocks.
  const [bump, setBump] = useState(0);
  useEffect(() => {
    const on = () => setBump((n) => n + 1);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  const total = ACHIEVEMENTS.length;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.button
        key={bump}
        type="button"
        className="pill trophy-pill cursor-target"
        data-cursor-label="trophies"
        aria-expanded={open}
        aria-label={`Achievements: ${got.size} of ${total}`}
        onClick={() => setOpen((o) => !o)}
        initial={bump ? { scale: 1.25 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 14 }}
      >
        <FiAward size={14} />
        <span className="mono">{got.size}/{total}</span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="ach-panel"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="ach-head">
              <div>
                <b>Achievements</b>
                <span>{got.size === total ? "All found. You're a legend." : `${got.size} of ${total} found. Explore to unlock the rest.`}</span>
              </div>
              <button type="button" className="ach-close" aria-label="Close" onClick={() => setOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="ach-bar"><span style={{ width: `${(got.size / total) * 100}%` }} /></div>
            <ul className="ach-list">
              {ACHIEVEMENTS.map((a) => {
                const has = got.has(a.id);
                return (
                  <li key={a.id} className={has ? "is-got" : ""}>
                    <span className="ach-icon">{has ? <a.icon size={15} /> : <FiLock size={14} />}</span>
                    <span>
                      <b>{has ? a.title : "???"}</b>
                      <small>{a.hint}</small>
                    </span>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className="ach-foot mono"
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event("rm:terminal"));
              }}
            >
              ❯ open the terminal <kbd>`</kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
