import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import resumeData from "../utils/resumeData";
import { ACHIEVEMENTS, unlock } from "./achievements";

/**
 * A hidden shell. Press ` anywhere (outside a text field) or dispatch
 * "rm:terminal" to open it. Commands read straight from resumeData, and a few
 * can drive the page: theme, goto, play.
 */

export const openTerminal = () => window.dispatchEvent(new Event("rm:terminal"));

const d = resumeData;
const SECTIONS = { top: "top", home: "top", about: "about", work: "work", projects: "work", expertise: "expertise", skills: "skills", experience: "experience", github: "github", activity: "github", games: "games", contact: "contact" };
const GAMES = { hunt: "hunt", bugs: "hunt", deploy: "deploy", type: "type", typing: "type", match: "match", memory: "match" };
const projects = d.experience[0].projects;

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
const open = (url) => window.open(url, "_blank", "noopener");

const HELP = [
  ["whoami", "who's behind this site"],
  ["about", "the short version"],
  ["skills", "what I build with"],
  ["projects", "selected work · open <n> to visit one"],
  ["experience", "where I've worked"],
  ["contact", "ways to reach me"],
  ["resume", "open my résumé (PDF)"],
  ["theme [light|dark]", "switch the theme"],
  ["goto <section>", "jump around the page"],
  ["play [hunt|deploy|type|match]", "start a game"],
  ["achievements", "see what you've found"],
  ["clear · exit", "tidy up or close"],
];

/** Each command returns lines: strings, or { text, cls } for colour. `close` closes the terminal after running. */
function run(raw, ctx) {
  const [cmd = "", ...args] = raw.trim().split(/\s+/);
  const arg = args.join(" ");
  const c = cmd.toLowerCase();

  switch (c) {
    case "":
      return [];
    case "help":
    case "?":
    case "man":
      return [
        { text: "Available commands:", cls: "accent" },
        ...HELP.map(([k, v]) => ({ text: `  ${k.padEnd(32)}${v}`, cls: "" })),
        { text: "…and a few secret ones. Tab completes, ↑ ↓ walks history.", cls: "dim" },
      ];
    case "whoami":
      return [{ text: `${d.name} · ${d.title}`, cls: "accent" }, d.tagline, `${d.location} · ${d.timezone}`];
    case "about":
    case "summary":
      return [d.summary, "", d.aboutExtra].filter((x) => x != null);
    case "skills":
    case "stack": {
      const rows = [
        ["frontend", d.skills.frontend],
        ["backend", d.skills.backend],
        ["payments", d.skills.payments],
        ["auth", d.skills.integrations],
        ["devops", d.skills.testingAndDevOps],
      ];
      return rows.map(([k, v]) => ({ text: `${k.padEnd(10)}${v.map((s) => s.name ?? s).join(", ")}`, cls: "" }));
    }
    case "projects":
    case "work":
    case "ls-projects":
      return [
        ...projects.map((p, i) => ({ text: `  ${i + 1}. ${p.name.padEnd(28)}${p.description}`, cls: "" })),
        { text: "Type open <n> to visit one.", cls: "dim" },
      ];
    case "open": {
      const p = projects[Number(arg) - 1];
      if (!p) return [{ text: `usage: open <1-${projects.length}>`, cls: "err" }];
      if (!p.url) return [`${p.name} is private, but there's a write-up in the Work section.`];
      open(p.url);
      return [{ text: `Opening ${p.name} in a new tab…`, cls: "accent" }];
    }
    case "experience":
    case "cv":
      return [
        ...d.experience.flatMap((job) => {
          const rows = Array.isArray(job.roles) && job.roles.length
            ? job.roles.map((r) => ({ title: r.title ?? r.role, when: r.duration ?? r.at ?? job.duration }))
            : [{ title: job.role, when: job.duration }];
          return rows.flatMap((r) => [
            { text: `${r.title} · ${job.company}`, cls: "accent" },
            `  ${r.when} · ${job.location}`,
          ]);
        }),
        { text: `${d.education[0].degree} · ${d.education[0].institution}`, cls: "dim" },
      ];
    case "contact":
      return [
        `email     ${d.email}`,
        `linkedin  ${d.linkedinUrl}`,
        `github    ${d.githubUrl}`,
        { text: "Try: email (copies it), linkedin, github, hire", cls: "dim" },
      ];
    case "email":
    case "mail":
      navigator.clipboard?.writeText(d.email).catch(() => {});
      return [{ text: `Copied ${d.email} to your clipboard.`, cls: "accent" }];
    case "linkedin":
      open(d.linkedinUrl);
      return ["Opening LinkedIn…"];
    case "github":
    case "gh":
      open(d.githubUrl);
      return ["Opening GitHub…"];
    case "resume":
    case "résumé":
      open(d.resumeDownloads[0].file);
      return ["Opening résumé…"];
    case "hire":
      ctx.close(() => scrollTo("contact"));
      return [{ text: "Great choice. Taking you to the contact form…", cls: "accent" }];
    case "theme": {
      const next = arg === "light" || arg === "dark" ? arg : document.documentElement.classList.contains("light") ? "dark" : "light";
      window.dispatchEvent(new CustomEvent("rm:theme", { detail: next }));
      return [`Theme set to ${next}.`];
    }
    case "goto":
    case "cd": {
      if (c === "cd" && (!arg || arg === "~" || arg === "/")) return ["You're already home."];
      const id = SECTIONS[arg.toLowerCase()];
      if (!id) return [{ text: `No such section. Try: ${[...new Set(Object.values(SECTIONS))].join(", ")}`, cls: "err" }];
      ctx.close(() => scrollTo(id));
      return [`→ ${id}`];
    }
    case "play":
    case "games": {
      const id = GAMES[arg.toLowerCase()] ?? (arg ? null : "hunt");
      if (!id) return [{ text: "Games: hunt, deploy, type, match", cls: "err" }];
      ctx.close(() => {
        scrollTo("games");
        window.dispatchEvent(new CustomEvent("rm:play", { detail: id }));
      });
      return [{ text: `Loading ${id}…`, cls: "accent" }];
    }
    case "achievements":
    case "trophies": {
      let got = [];
      try {
        got = JSON.parse(localStorage.getItem("rm-achievements") || "[]");
      } catch {}
      return [
        { text: `${got.length}/${ACHIEVEMENTS.length} unlocked`, cls: "accent" },
        ...ACHIEVEMENTS.map((a) => {
          const has = got.includes(a.id);
          return { text: `  ${has ? "[x]" : "[ ]"} ${has ? a.title : "???"} · ${a.hint}`, cls: has ? "" : "dim" };
        }),
      ];
    }
    case "ls":
      return [{ text: "about.txt  projects/  skills.json  resume.pdf  games/  .secrets", cls: "" }];
    case "cat": {
      if (arg === "about.txt") return run("about", ctx);
      if (arg === "skills.json") return JSON.stringify({ frontend: ["React", "Next.js", "TypeScript"], backend: ["Rails", "PostgreSQL", "Redis"], payments: ["Stripe"] }, null, 2).split("\n");
      if (arg === "resume.pdf") return ["%PDF-1.7 ����… that's binary. Try: resume"];
      if (arg === ".secrets") return ["The best code is the code you don't have to write.", "Also: try sudo, vim, or the Konami code."];
      return [{ text: `cat: ${arg || "?"}: No such file. Try ls.`, cls: "err" }];
    }
    case "pwd":
      return ["/home/syed/portfolio"];
    case "date":
      return [new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Karachi" }).format(new Date()) + " (Lahore)"];
    case "echo":
      return [arg];
    case "hi":
    case "hello":
    case "hey":
      return ["Hey! Glad you found this. Type help to look around."];
    case "sudo":
      unlock("sudo");
      return [{ text: `[sudo] password for guest: ********`, cls: "dim" }, { text: "guest is not in the sudoers file. This incident will be reported.", cls: "err" }];
    case "rm":
      return arg.includes("-rf") ? [{ text: "Nice try. There are backups. And tests.", cls: "err" }] : [{ text: "rm: permission denied", cls: "err" }];
    case "vim":
    case "vi":
    case "nano":
    case "emacs":
      return [`Opening ${c}… just kidding. Nobody has ever exited it. Type exit instead.`];
    case "coffee":
    case "brew":
      return ["Brewing…", "████████████ 100%", { text: "Done. Ready to ship.", cls: "accent" }];
    case "git":
      return arg.startsWith("push") ? [{ text: "Everything up-to-date. Ship it.", cls: "accent" }] : ["On branch main. Your portfolio is clean."];
    case "npm":
    case "yarn":
      return ["added 1 developer, audited 0 vulnerabilities."];
    case "rails":
      return ["=> Booting Puma", "=> Rails 7 application starting in production", { text: "* Listening on http://syed:3000 — hire away", cls: "accent" }];
    case "exit":
    case "quit":
    case "q":
      ctx.close();
      return [];
    case "clear":
    case "cls":
      ctx.clear();
      return [];
    default:
      return [{ text: `command not found: ${cmd}. Type help.`, cls: "err" }];
  }
}

const COMMANDS = ["help", "whoami", "about", "skills", "projects", "open", "experience", "contact", "email", "linkedin", "github", "resume", "hire", "theme", "goto", "play", "achievements", "ls", "cat", "pwd", "date", "echo", "sudo", "coffee", "clear", "exit"];

const WELCOME = [
  { text: "syed@portfolio ~ v2.0", cls: "accent" },
  { text: "Welcome to the shell. Type help to see what's here.", cls: "dim" },
];

export function Terminal() {
  const [isOpen, setOpen] = useState(false);
  const [lines, setLines] = useState(WELCOME);
  const [value, setValue] = useState("");
  const history = useRef([]);
  const hIdx = useRef(-1);
  const input = useRef(null);
  const body = useRef(null);
  const after = useRef(null);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      unlock("terminal");
    };
    const onKey = (e) => {
      const t = e.target;
      const typing = t?.tagName === "INPUT" || t?.tagName === "TEXTAREA" || t?.isContentEditable;
      if (e.key === "`" && !typing) {
        e.preventDefault();
        setOpen((o) => {
          if (!o) unlock("terminal");
          return !o;
        });
      }
    };
    window.addEventListener("rm:terminal", show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("rm:terminal", show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => input.current?.focus(), 60);
  }, [isOpen]);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight });
  }, [lines]);

  const submit = (e) => {
    e.preventDefault();
    const raw = value;
    setValue("");
    hIdx.current = -1;
    if (raw.trim()) history.current.unshift(raw);
    let cleared = false;
    const ctx = {
      clear: () => (cleared = true),
      close: (then) => {
        after.current = then ?? null;
        setTimeout(() => setOpen(false), 450);
      },
    };
    const out = run(raw, ctx).map((l) => (typeof l === "string" ? { text: l, cls: "" } : l));
    if (cleared) setLines([]);
    else setLines((ls) => [...ls, { text: raw, cls: "cmd" }, ...out]);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      hIdx.current = e.key === "ArrowUp" ? Math.min(h.length - 1, hIdx.current + 1) : Math.max(-1, hIdx.current - 1);
      setValue(hIdx.current === -1 ? "" : h[hIdx.current]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = COMMANDS.filter((c) => c.startsWith(value.trim().toLowerCase()));
      if (matches.length === 1) setValue(matches[0] + " ");
      else if (matches.length > 1 && value.trim()) setLines((ls) => [...ls, { text: matches.join("  "), cls: "dim" }]);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <AnimatePresence
      onExitComplete={() => {
        after.current?.();
        after.current = null;
      }}
    >
      {isOpen && (
        <motion.div
          className="term-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            className="term"
            role="dialog"
            aria-label="Terminal"
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onPointerDown={() => setTimeout(() => input.current?.focus())}
          >
            <div className="term-bar">
              <span className="term-dots">
                <button type="button" aria-label="Close terminal" onClick={() => setOpen(false)} />
                <i />
                <i />
              </span>
              <span className="mono">syed@portfolio: ~</span>
              <span className="mono term-esc">esc</span>
            </div>
            <div className="term-body mono" ref={body} data-lenis-prevent>
              {lines.map((l, i) =>
                l.cls === "cmd" ? (
                  <div key={i} className="term-line">
                    <span className="term-ps">❯</span> {l.text}
                  </div>
                ) : (
                  <div key={i} className={`term-line ${l.cls}`}>{l.text || " "}</div>
                )
              )}
              <form onSubmit={submit} className="term-input-row">
                <span className="term-ps">❯</span>
                <input
                  ref={input}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="Terminal command"
                  enterKeyHint="send"
                />
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
