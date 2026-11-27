import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { FiArrowUpRight, FiBookOpen, FiClock, FiCoffee, FiCreditCard, FiGlobe, FiHeadphones, FiLayers, FiMapPin, FiMoon, FiPhoneCall, FiRefreshCw, FiSun, FiUploadCloud, FiUsers, FiZap } from "react-icons/fi";
import resumeData from "../../utils/resumeData";
import SpotlightCard from "../../components/reactbits/SpotlightCard";
import CountUp from "../../components/reactbits/CountUp";
import DecryptedText from "../../components/reactbits/DecryptedText";
import { Reveal, SectionHead } from "../parts";
import { useSpot } from "./Glance";
import { usePointerFine } from "../../hooks/usePointerFine";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/* ── Scroll-scrubbed bio ─────────────────────────────────────────────────
   Words light up one by one as the paragraph scrolls through the viewport.
   Words wrapped in *asterisks* light up in the accent colour. */

function Word({ progress, range, accent, reduced, children }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <motion.span className={accent ? "hl" : undefined} style={{ opacity: reduced ? 1 : opacity }}>
        {children}
      </motion.span>{" "}
    </>
  );
}

function ScrubText({ text, className }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "end 50%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={w.startsWith("*")} reduced={reduced}>
          {w.replace(/\*/g, "")}
        </Word>
      ))}
    </p>
  );
}

/* ── 3D tilt that follows the pointer ──────────────────────────────────── */

function Tilt({ children, max = 7 }) {
  const fine = usePointerFine();
  const reduced = usePrefersReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 220, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 220, damping: 18 });
  const on = fine && !reduced;

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      style={{ height: "100%", rotateX: on ? rotateX : 0, rotateY: on ? rotateY : 0, transformPerspective: 900 }}
      onPointerMove={on ? move : undefined}
      onPointerLeave={on ? reset : undefined}
    >
      {children}
    </motion.div>
  );
}

/* ── Day/night card for local (Lahore) time ────────────────────────────── */

function localNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "Asia/Karachi" }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { h: get("hour"), m: get("minute"), s: get("second") };
}

const SKIES = {
  night: "linear-gradient(180deg, #070b1f 0%, #141c45 70%, #26306a 100%)",
  dawn: "linear-gradient(180deg, #3b4a9e 0%, #c77d8f 65%, #f6b27a 100%)",
  day: "linear-gradient(180deg, #2f7fd0 0%, #67b4ec 60%, #b9e2fb 100%)",
  dusk: "linear-gradient(180deg, #2b2468 0%, #9a4f86 60%, #f08a5d 100%)",
};

function mood(h) {
  if (h < 7) return [FiMoon, "Probably asleep"];
  if (h < 9) return [FiCoffee, "Coffee first"];
  if (h < 12) return [FiHeadphones, "Deep work mode"];
  if (h < 13) return [FiSun, "Lunch break"];
  if (h < 18) return [FiUploadCloud, "Shipping things"];
  if (h < 22) return [FiPhoneCall, "Reviews & US calls"];
  return [FiMoon, "Probably asleep"];
}

const STARS = Array.from({ length: 18 }, (_, i) => ({ x: (i * 53) % 100, y: (i * 37) % 60, d: (i % 5) * 0.6 }));

function SkyClock() {
  const [now, setNow] = useState(localNow);
  useEffect(() => {
    const id = setInterval(() => setNow(localNow()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = now.h + now.m / 60;
  const phase = hour < 5 || hour >= 21 ? "night" : hour < 8 ? "dawn" : hour < 17 ? "day" : "dusk";
  const isDay = hour >= 6 && hour < 20;
  // Sun travels 06:00 → 20:00, moon 20:00 → 06:00, both along the same arc.
  const t = isDay ? (hour - 6) / 14 : ((hour - 20 + 24) % 24) / 10;
  const x = 8 + t * 84;
  const y = 60 - Math.sin(Math.PI * t) * 44;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="sky-card" style={{ background: SKIES[phase] }}>
      {!isDay && STARS.map((s, i) => <i key={i} className="sky-star" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} />)}
      <motion.span
        className={`sky-orb ${isDay ? "is-sun" : "is-moon"}`}
        animate={{ left: `${x}%`, top: `${y}%` }}
        transition={{ type: "spring", stiffness: 40, damping: 14 }}
      />
      <div className="sky-hills" />
      <div className="sky-content">
        <span className="sky-k">{resumeData.location} · my time</span>
        <div>
          <div className="sky-time mono">
            {pad(now.h)}:{pad(now.m)}
            <span>:{pad(now.s)}</span>
          </div>
          <div className="sky-mood">{(([Icon, text]) => <><Icon size={13} /> {text}</>)(mood(now.h))}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Fact roulette ─────────────────────────────────────────────────────── */

const FACTS = [
  "I was the sole engineer on CinnaLab PRM — zero to production in eight months.",
  `I maintain ${resumeData.openSource.gems.length} published Rails gems, ${resumeData.openSource.combinedDownloads.toLocaleString()}+ downloads and counting.`,
  "I've shipped across 7 SaaS products — PRM, fintech, ed-tech, e-commerce and college athletics.",
  "I work GMT+5, with 4–5 hours of daily overlap with EU teams.",
  "I ran a zero-data-loss billing migration from Paddle to Chargebee.",
  "I studied Computer Science at UET Lahore.",
  "I built four mini-games for this site. Scroll down and set a high score.",
  "There's a hidden terminal on this page. Press ` to open it.",
];

function FactRoulette() {
  const [i, setI] = useState(0);
  const [spin, setSpin] = useState(0);
  const next = () => {
    setSpin((s) => s + 1);
    setI((n) => {
      let r = n;
      while (r === n) r = Math.floor(Math.random() * FACTS.length);
      return r;
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="k">Random fact</span>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--dim)" }}>{String(i + 1).padStart(2, "0")}/{String(FACTS.length).padStart(2, "0")}</span>
      </div>
      <p className="fact-text">
        <DecryptedText key={i} text={FACTS[i]} animateOn="view" speed={22} maxIterations={8} sequential revealDirection="start" encryptedClassName="fact-enc" />
      </p>
      <button type="button" className="fact-btn cursor-target" data-cursor-label="another!" onClick={next}>
        <motion.span animate={{ rotate: spin * 360 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ display: "grid" }}>
          <FiRefreshCw size={14} />
        </motion.span>
        Another one
      </button>
    </div>
  );
}

/* ── Section ───────────────────────────────────────────────────────────── */

const STATS = [
  { to: 4, suffix: "+", label: "Years in production", icon: FiClock },
  { to: 6, suffix: "+", label: "SaaS platforms shipped", icon: FiLayers },
  { to: 500, prefix: "$", suffix: "K+", label: "GMV through my payment code", icon: FiCreditCard },
  { to: 2000, suffix: "+", separator: ",", label: "Active users served", icon: FiUsers },
];

// Derived from the résumé's ongoing roles so this block and the Experience
// timeline can never disagree about what I'm currently doing.
const NOW = resumeData.experience
  .filter((e) => /present/i.test(e.duration))
  .flatMap((e) =>
    Array.isArray(e.roles) && e.roles.length
      ? e.roles.map((r) => ({ role: r.title ?? r.role, at: e.company, where: e.location, url: e.companyUrl }))
      : [{ role: e.role, at: e.company, where: e.location, url: e.companyUrl }]
  );

const FACT_CHIPS = [
  [FiMapPin, resumeData.location],
  [FiGlobe, "On-site (Lahore) or remote"],
  // Degree read from the résumé rather than retyped, so it can't go stale.
  [FiBookOpen, `${resumeData.education[0].degree} · UET Lahore`],
  [FiZap, "GMT+5 · EU overlap"],
];

const BIO =
  "I'm a full-stack engineer who likes owning the whole thing: the *schema,* the *API,* the *interface* and the *deploy.* I've shipped across *seven* *production* *SaaS* *products* in PRM, fintech, ed-tech, e-commerce and college athletics — including one I built *solo,* from zero to production.";

export function About() {
  const SPOT = useSpot();
  const learning = resumeData.skills.currentlyLearning?.map((s) => s.name) ?? [];

  return (
    <section className="sec" id="about">
      <div className="wrap">
        <SectionHead eyebrow="About" title="Hi, I'm Syed." accent="I build software that ships." />

        <div className="about-grid">
          <div className="about-story">
            <ScrubText text={BIO} className="about-bio" />
            <Reveal delay={0.05}>
              <p className="about-sub">
                Today I&apos;m a Senior Software Engineer at Stackworx, working on Midway Sports&apos; Rails + Shopify platform — inventory sync,
                the out-of-stock lifecycle and returns. I care about clear ownership and integrations that survive real traffic.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="about-facts">
                <span className="chip about-status">
                  <span className="live-dot" /> {resumeData.availability.status}
                </span>
                {FACT_CHIPS.map(([Icon, f]) => (
                  <motion.span key={f} className="chip" whileHover={{ y: -3, rotate: -1.5 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                    <Icon size={13} className="chip-icon" /> {f}
                  </motion.span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <blockquote className="about-quote serif">“{resumeData.railsClosingLine}”</blockquote>
            </Reveal>
          </div>

          <div className="about-bento">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.label} delay={i * 0.06} style={{ height: "100%" }}>
                  <Tilt>
                    <SpotlightCard {...SPOT}>
                      <div className="stat-card">
                        <span className="stat-icon"><Icon size={16} /></span>
                        <div>
                          <div className="stat-num">
                            <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} separator={s.separator ?? ""} duration={2} />
                          </div>
                          <div style={{ color: "var(--muted)", marginTop: 10, fontSize: 13.5 }}>{s.label}</div>
                        </div>
                      </div>
                    </SpotlightCard>
                  </Tilt>
                </Reveal>
              );
            })}

            <Reveal className="span-2" delay={0.08} style={{ height: "100%" }}>
              <SpotlightCard {...SPOT}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="k">Currently</span>
                  <span className="now-live"><span className="live-dot" /> live</span>
                </div>
                <div style={{ display: "grid", marginTop: 10 }}>
                  {NOW.map((r) => (
                    <a key={r.at} href={r.url} target="_blank" rel="noreferrer" className="now-row cursor-target" data-cursor-label="visit">
                      <span>
                        <span className="display" style={{ display: "block", fontSize: 18 }}>{r.at}</span>
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>{r.role} · {r.where}</span>
                      </span>
                      <FiArrowUpRight className="now-arrow" />
                    </a>
                  ))}
                </div>
                {learning.length > 0 && (
                  <div className="now-learning">
                    <span className="mono">learning →</span>
                    {learning.map((l) => (
                      <span key={l} className="chip" style={{ fontSize: 12 }}>{l}</span>
                    ))}
                  </div>
                )}
              </SpotlightCard>
            </Reveal>

            <Reveal delay={0.12} style={{ height: "100%" }}>
              <Tilt max={5}>
                <SkyClock />
              </Tilt>
            </Reveal>

            <Reveal delay={0.16} style={{ height: "100%" }}>
              <SpotlightCard {...SPOT}>
                <FactRoulette />
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
