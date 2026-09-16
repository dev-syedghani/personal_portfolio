import React, { useEffect, useState, useRef } from "react";
import resumeData from "../utils/resumeData";
import C from "../theme";
import { IconDownload } from "./Icons";
import { useScrollSpy } from "../hooks/useScrollSpy";

// Module-level constant: a fresh array each render would re-run the spy's effect
// on every scroll-driven re-render.
const SECTION_IDS = [
  "case-studies", "projects", "rails-showcase", "tech-stack", "skills", "process",
  "gems", "github", "experience", "testimonials", "about", "education", "contact",
];

function ResumeDropdown() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("touchstart", onDocClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          padding: "7px 14px",
          borderRadius: 100,
          border: `1px solid ${C.border}`,
          background: "transparent",
          color: C.primary,
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Resume ▾
      </button>
      {open && (
        <div
          role="menu"
          className="glass-popover"
          style={{
            position: "absolute",
            right: 0,
            marginTop: 10,
            borderRadius: 12,
            zIndex: 60,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", minWidth: 220 }}>
            {resumeData.resumeDownloads.map((dl, i) => (
              <a
                key={i}
                href={dl.file}
                download={dl.file.split("/").pop()}
                onClick={() => setOpen(false)}
                role="menuitem"
                style={{
                  padding: "10px 14px",
                  textDecoration: "none",
                  color: C.primary,
                  borderBottom: i < resumeData.resumeDownloads.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                {dl.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Every section on the page, in document order. Labels are kept short so the
// full set fits the capsule. (There used to be a "#resume" entry here that
// pointed at an element that doesn't exist — it scrolled nowhere. Resume
// downloads live in the dropdown beside this row and in the mobile drawer.)
const LINKS = [
  ["#case-studies", "Work"],
  ["#rails-showcase", "Engineering"],
  ["#tech-stack", "Stack"],
  ["#gems", "Open Source"],
  ["#github", "Activity"],
  ["#experience", "Experience"],
  ["#testimonials", "Reviews"],
  ["#about", "About"],
  ["#contact", "Contact"],
];

export function Nav({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close the drawer on Escape, and if the viewport grows back to desktop
  // (where the drawer is hidden but would otherwise stay "open" in state).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const activeId = useScrollSpy(SECTION_IDS);

  return (
    <>
      {/* A floating capsule inset from every edge — never a full-width bar —
          that shrinks and firms up its glass once the page scrolls under it. */}
      <nav
        style={{
          position: "fixed",
          top: scrolled ? 12 : 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          width: "calc(100% - 32px)",
          maxWidth: 1080,
          borderRadius: 100,
          transition: "top 0.3s ease",
        }}
      >
        <div
          className="glass"
          style={{
            borderRadius: 100,
            padding: scrolled ? "6px 8px 6px 18px" : "9px 10px 9px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            transition: "padding 0.3s ease",
          }}
        >
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: C.primary,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              SG
            </div>
          </a>

          <div className="nav-links">
            {LINKS.map(([href, label]) => {
              const isActive = href.slice(1) === activeId;
              return (
                <a
                  key={href}
                  href={href}
                  aria-current={isActive ? "true" : undefined}
                  style={{
                    position: "relative",
                    color: isActive ? C.primary : C.secondary,
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                    padding: "6px 2px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? C.primary : C.secondary)}
                >
                  {label}
                </a>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              onClick={toggleTheme}
              id="theme-toggle"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                background: "transparent",
                color: C.secondary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <span className="nav-resume-desktop">
              <ResumeDropdown />
            </span>
            <a
              id="nav-hire-cta"
              href="#contact"
              className="nav-hire"
              style={{
                padding: "8px 18px",
                background: C.primary,
                color: C.bg,
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Inter',sans-serif",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Hire Me
            </a>

            {/* Below 1024px the .nav-links row is hidden, so this is the only way
                to reach the sections — without it mobile has no navigation at all. */}
            <button
              className="nav-burger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${C.border}`,
                background: "transparent",
                color: C.primary,
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 4,
                padding: 0,
                flexShrink: 0,
              }}
            >
              <span style={{ display: "block", width: 14, height: 1.5, borderRadius: 2, background: "currentColor", transition: "transform 0.25s", transform: menuOpen ? "translateY(2.5px) rotate(45deg)" : "none" }} />
              <span style={{ display: "block", width: 14, height: 1.5, borderRadius: 2, background: "currentColor", transition: "transform 0.25s", transform: menuOpen ? "translateY(-2.5px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen glass overlay on mobile, not a dropdown panel under a bar. */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="nav-drawer glass-popover"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
            // `justifyContent: "center"` on a fixed, non-scrolling container
            // was the bug: 9 links + 2 resume buttons is taller than most
            // phone screens, and centering overflowing content in a flex
            // column clips it at *both* ends with no way to reach the rest —
            // exactly "Work" cut off at the top and the second download
            // button cut off at the bottom. Left-aligned top-to-bottom flow
            // inside a scrollable container fixes both at once.
            justifyContent: "flex-start",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "96px 32px 40px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {LINKS.map(([href, label], i) => {
              const isActive = href.slice(1) === activeId;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? "true" : undefined}
                  style={{
                    padding: "14px 0",
                    color: isActive ? C.primary : C.secondary,
                    fontSize: "clamp(24px,7vw,32px)",
                    fontFamily: "'Inter',sans-serif",
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: "none",
                    borderBottom: i < LINKS.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  {label}
                </a>
              );
            })}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 32 }}>
              {resumeData.resumeDownloads.map((dl, i) => (
                <a
                  key={i}
                  href={dl.file}
                  download={dl.file.split("/").pop()}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    color: C.primary,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  <IconDownload /> {dl.label}
                </a>
              ))}
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.primary,
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
