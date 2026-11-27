import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUpRight, FiBriefcase, FiCheck, FiCopy, FiDownload, FiGithub, FiLinkedin, FiMessageCircle, FiSend, FiTool } from "react-icons/fi";
import resumeData from "../../utils/resumeData";
import Magnet from "../../components/reactbits/Magnet";
import { Reveal } from "../parts";
import { unlock } from "../achievements";

const TOPICS = [
  { id: "role", icon: FiBriefcase, label: "Full-time role" },
  { id: "contract", icon: FiTool, label: "Contract project" },
  { id: "hi", icon: FiMessageCircle, label: "Just saying hi" },
];

const STARTERS = {
  role: ["We're hiring a full-stack engineer.", "It's a remote React + Rails role.", "Could we set up a quick call?"],
  contract: ["I need help with a Rails app.", "We're building a Next.js MVP.", "We need Stripe integration work."],
  hi: ["Loved the portfolio!", "I beat your Bug Hunt score.", "I found the terminal."],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = 1000;
const EMPTY = { name: "", email: "", company: "", message: "", botcheck: false };

/**
 * Sends through Web3Forms when the build has an access key (production); in
 * local dev and forks it opens the visitor's mail app with everything filled in.
 */
function useContactForm() {
  const [state, setState] = useState("idle");
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  const send = async (v) => {
    const topic = TOPICS.find((t) => t.id === v.topic);
    const subject = `[${topic.label}] from ${v.name}${v.company ? ` (${v.company})` : ""}`;
    setState("sending");

    if (!key) {
      const body = `Name: ${v.name}\nCompany: ${v.company || "-"}\nEmail: ${v.email}\nAbout: ${topic.label}\n\n${v.message}`;
      window.location.href = `mailto:${resumeData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setState("mailto");
      return true;
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject,
          from_name: "Syed Ghani Portfolio",
          name: v.name,
          email: v.email,
          company: v.company,
          hiring_for: topic.label,
          message: v.message,
          botcheck: v.botcheck,
        }),
      });
      const data = await res.json();
      setState(data.success ? "success" : "error");
      return data.success;
    } catch {
      setState("error");
      return false;
    }
  };

  return { state, setState, send };
}

/** Text field with a label that floats up on focus, a ✓ when valid and a short error below. */
function Field({ id, label, optional, value, onChange, onBlur, error, valid, multiline, children, ...props }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className={`cf-field${error ? " is-invalid" : ""}${valid ? " is-valid" : ""}${multiline ? " is-multi" : ""}`}>
      <Tag id={id} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} placeholder=" " aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      <label htmlFor={id}>
        {label}
        {optional && <span className="cf-opt"> · optional</span>}
      </label>
      <AnimatePresence>
        {valid && (
          <motion.span className="cf-ok" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
            <FiCheck size={12} />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span id={`${id}-err`} className="cf-err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

const BURST = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  return { x: Math.cos(a) * (70 + (i % 3) * 18), y: Math.sin(a) * (70 + (i % 3) * 18), d: (i % 4) * 0.03 };
});

function SentView({ name, mailto, onReset }) {
  return (
    <motion.div
      key="sent"
      className="sent-view"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="sent-mark">
        {BURST.map((b, i) => (
          <motion.i
            key={i}
            className="sent-dot"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: b.x, y: b.y, scale: [0, 1, 0.4], opacity: [1, 1, 0] }}
            transition={{ duration: 0.9, delay: 0.25 + b.d, ease: "easeOut" }}
          />
        ))}
        <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
          <motion.circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
          <motion.path d="M20 33l8 8 16-17" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.45 }} />
        </svg>
      </div>
      <h3 className="display">{mailto ? "Almost there!" : `Thanks${name ? `, ${name.split(" ")[0]}` : ""}!`}</h3>
      <p>{mailto ? "Your mail app should have opened with the message ready to go. Just hit send." : "Your message landed in my inbox. I usually reply within a day."}</p>
      <button type="button" className="btn btn-ghost cursor-target" data-cursor-label="again" onClick={onReset} style={{ height: 42, fontSize: 13.5 }}>
        Send another
      </button>
    </motion.div>
  );
}

function ContactForm() {
  const { state, setState, send } = useContactForm();
  const [topic, setTopic] = useState("role");
  const [v, setV] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [tried, setTried] = useState(false);
  const [sentName, setSentName] = useState("");
  const set = (k) => (val) => setV((o) => ({ ...o, [k]: k === "message" ? val.slice(0, MAX) : val }));
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const ok = { name: v.name.trim().length > 1, email: EMAIL_RE.test(v.email.trim()), message: v.message.trim().length > 9 };
  const ready = ok.name && ok.email && ok.message;
  const show = (k) => (tried || touched[k]) && !ok[k];
  const errors = {
    name: show("name") && "Please add your name.",
    email: show("email") && (v.email ? "That email doesn't look right." : "I need an email to reply to."),
    message: show("message") && "A few more words, please.",
  };

  const submit = async (e) => {
    e?.preventDefault();
    setTried(true);
    if (!ready) {
      const first = !ok.name ? "cf-name" : !ok.email ? "cf-email" : "cf-message";
      document.getElementById(first)?.focus();
      return;
    }
    const done = await send({ ...v, topic });
    if (done) {
      setSentName(v.name);
      setV(EMPTY);
      setTouched({});
      setTried(false);
      unlock("hello");
    }
  };

  const addStarter = (text) => {
    setV((o) => ({ ...o, message: (o.message ? `${o.message.trimEnd()} ${text}` : text).slice(0, MAX) }));
    document.getElementById("cf-message")?.focus();
  };

  return (
    <AnimatePresence mode="wait">
      {state === "success" || state === "mailto" ? (
        <SentView name={sentName} mailto={state === "mailto"} onReset={() => setState("idle")} />
      ) : (
        <motion.form key="form" className="cf" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
          <fieldset className="cf-topics">
            <legend className="k">What's it about?</legend>
            <div className="cf-topic-row" role="radiogroup">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={topic === t.id}
                  className={`cf-topic cursor-target${topic === t.id ? " is-on" : ""}`}
                  data-cursor-label={t.label.toLowerCase()}
                  onClick={() => setTopic(t.id)}
                >
                  {topic === t.id && <motion.span layoutId="cf-topic-bg" className="cf-topic-bg" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                  <t.icon size={14} aria-hidden="true" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="cf-row">
            <Field id="cf-name" label="Your name" value={v.name} onChange={set("name")} onBlur={touch("name")} error={errors.name} valid={ok.name} autoComplete="name" />
            <Field id="cf-email" label="Email" type="email" inputMode="email" value={v.email} onChange={set("email")} onBlur={touch("email")} error={errors.email} valid={ok.email} autoComplete="email" />
          </div>
          <Field id="cf-company" label="Company" optional value={v.company} onChange={set("company")} autoComplete="organization" />
          <Field
            id="cf-message"
            label="Message"
            multiline
            rows={5}
            value={v.message}
            onChange={set("message")}
            onBlur={touch("message")}
            onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && submit()}
            error={errors.message}
            valid={ok.message}
          >
            <span className="cf-count mono">{v.message.length}/{MAX}</span>
          </Field>

          <div className="cf-starters">
            <span className="mono">Need a start?</span>
            {STARTERS[topic].map((t) => (
              <motion.button key={t} type="button" className="chip cursor-target" data-cursor-label="add" onClick={() => addStarter(t)} whileTap={{ scale: 0.92 }}>
                + {t}
              </motion.button>
            ))}
          </div>

          {/* Honeypot: real people never see or fill this. */}
          <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="cf-honey" checked={v.botcheck} onChange={(e) => set("botcheck")(e.target.checked)} aria-hidden="true" />

          <div className="cf-actions">
            <span className="cf-hint">
              {state === "error" ? (
                <span style={{ color: "var(--danger)" }}>
                  Couldn't send just now. Try again or <a href={`mailto:${resumeData.email}`}>email me directly</a>.
                </span>
              ) : (
                <span className="cf-kbd mono">
                  <kbd>⌘</kbd> + <kbd>Enter</kbd> sends
                </span>
              )}
            </span>
            <Magnet padding={40} magnetStrength={4} maxOffset={8}>
              <button type="submit" className={`btn btn-primary cf-send cursor-target${ready ? " is-ready" : ""}`} data-cursor-label="send" disabled={state === "sending"}>
                {state === "sending" ? "Sending…" : state === "error" ? "Try again" : "Send message"}
                <motion.span
                  animate={state === "sending" ? { x: [0, 24], y: [0, -24], opacity: [1, 0] } : { x: 0, y: 0, opacity: 1 }}
                  transition={state === "sending" ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
                  style={{ display: "grid" }}
                >
                  <FiSend />
                </motion.span>
              </button>
            </Magnet>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resumeData.email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${resumeData.email}`;
    }
  };

  return (
    <button type="button" onClick={copy} className="cp-email cursor-target" data-cursor-label={copied ? "copied!" : "copy"} aria-label={`Copy ${resumeData.email}`}>
      <span className="cp-email-text">{resumeData.email}</span>
      <span className={`cp-email-icon${copied ? " is-copied" : ""}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={copied ? "y" : "n"} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.15 }} style={{ display: "grid" }}>
            {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

const LINKS = [
  { href: resumeData.linkedinUrl, icon: <FiLinkedin />, text: "LinkedIn" },
  { href: resumeData.githubUrl, icon: <FiGithub />, text: "GitHub" },
  { href: resumeData.resumeDownloads[0].file, icon: <FiDownload />, text: "Résumé", download: true },
];

export function Contact() {
  return (
    <section className="sec" id="contact">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">Contact</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="h2 contact-title">
            Let's build <span className="serif">something good.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="contact-panel">
            <aside className="cp-side">
              <div className="cp-glow" aria-hidden="true" />
              <p className="cp-intro">
                Hiring, got a project, or just want to say hi? Send a note and I'll get back to you <b>within a day</b>.
              </p>

              <div className="cp-block">
                <span className="k">Email</span>
                <CopyEmail />
              </div>

              <div className="cp-block">
                <span className="k">Open to</span>
                <div className="cp-chips">
                  {resumeData.availability.modes.map((m) => (
                    <span key={m} className="chip">
                      <span className="live-dot" /> {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cp-block">
                <span className="k">Based in</span>
                <p className="cp-text">{resumeData.location} · happy to work across any time zone, async-first.</p>
              </div>

              <div className="cp-links">
                {LINKS.map((l) => (
                  <a
                    key={l.text}
                    href={l.href}
                    target={l.download ? undefined : "_blank"}
                    rel="noreferrer"
                    download={l.download || undefined}
                    className="cp-link cursor-target"
                    data-cursor-label={l.download ? "download" : "open"}
                  >
                    {l.icon}
                    <span>{l.text}</span>
                    <FiArrowUpRight className="cp-link-arrow" />
                  </a>
                ))}
              </div>
            </aside>

            <div className="cp-main">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
