import React from "react";
import resumeData from "../utils/resumeData";
import C, { alpha } from "../theme";

export function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "48px 0", background: `${alpha(C.surface, "50")}` }}>
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: C.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.bg,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Inter',sans-serif",
            }}
          >
            SG
          </div>
          <div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, color: C.primary, fontSize: 14, margin: 0 }}>
              Syed M. Ghani
            </p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", color: C.secondary, fontSize: 11, margin: 0 }}>
              Rails · React · Lahore & Remote
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, fontSize: 13, color: C.secondary }}>
          {[
            ["LinkedIn", resumeData.linkedinUrl],
            ["GitHub", resumeData.githubUrl],
            ["Resume", resumeData.resumeDownloads[0].file],
            ["Email", `mailto:${resumeData.email}`],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{ color: C.secondary, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.target.style.color = C.accentText)}
              onMouseLeave={(e) => (e.target.style.color = C.secondary)}
            >
              {label}
            </a>
          ))}
        </div>

        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.secondary, margin: 0 }}>
          © {new Date().getFullYear()} Syed M. Ghani
        </p>
      </div>
    </footer>
  );
}
