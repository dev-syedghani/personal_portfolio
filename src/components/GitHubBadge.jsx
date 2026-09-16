import React, { useEffect, useState } from "react";
import C, { alpha } from "../theme";

const GITHUB_USERNAME = "dev-syedghani";

// GitHub achievement data (hardcoded — GitHub API doesn't expose these)
const ACHIEVEMENTS = [
  {
    title: "Arctic Code Vault Contributor",
    src: "https://github.githubassets.com/images/modules/profile/achievements/arctic-code-vault-contributor-default.png",
  },
  {
    title: "Pull Shark",
    src: "https://github.githubassets.com/images/modules/profile/achievements/pull-shark-default.png",
  },
  {
    title: "Quickdraw",
    src: "https://github.githubassets.com/images/modules/profile/achievements/quickdraw-default.png",
  },
];

const GitHubLogo = () => (
  <svg height="18" viewBox="0 0 16 16" fill="currentColor" style={{ display: "inline-block" }}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export default function GitHubBadge() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
      .then((r) => r.json())
      .then((data) => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    background: C.surface,
    border: `1px solid ${C.border}`,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
    transition: "transform 0.25s, box-shadow 0.25s",
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
  };

  if (loading) {
    return (
      <div style={{ ...cardStyle, padding: 28, minHeight: 280 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <GitHubLogo />
          <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.12em", color: C.secondary }}>GitHub</span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.secondary, fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>
          Loading…
        </div>
      </div>
    );
  }

  return (
    <a
      href={`https://github.com/${GITHUB_USERNAME}`}
      target="_blank"
      rel="noreferrer"
      style={cardStyle}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.28)"; }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: `${alpha(C.bg, "80")}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.primary }}>
          <GitHubLogo />
          <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.12em", color: C.secondary }}>GitHub</span>
        </div>
        <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.secondary }}>public profile</span>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px 16px", gap: 8, flex: 1 }}>
        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: `2px solid ${C.border}`, marginBottom: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
          <img
            src={profile?.avatar_url || `https://avatars.githubusercontent.com/${GITHUB_USERNAME}`}
            alt={profile?.name || GITHUB_USERNAME}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: C.primary, fontSize: 15, textAlign: "center" }}>
          {profile?.name || GITHUB_USERNAME}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", color: C.secondary, fontSize: 12 }}>
          @{profile?.login || GITHUB_USERNAME}
        </div>

        {profile?.bio && (
          <p style={{ fontSize: 12, color: C.secondary, lineHeight: 1.5, textAlign: "center", margin: "4px 0 0", maxWidth: 220 }}>
            {profile.bio}
          </p>
        )}

        {profile?.location && (
          <div style={{ fontSize: 11, color: C.secondary, fontFamily: "'JetBrains Mono',monospace" }}>
            📍 {profile.location}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginTop: 12, width: "100%" }}>
          {[
            { label: "Repos", value: profile?.public_repos ?? "—" },
            { label: "Followers", value: profile?.followers ?? "—" },
            { label: "Following", value: profile?.following ?? "—" },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "10px 6px", borderRadius: 10, background: `${alpha(C.copper, "10")}`, border: `1px solid ${alpha(C.copper, "20")}` }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 16, color: C.accentText }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: C.secondary, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {ACHIEVEMENTS.map((ach, i) => (
            <div
              key={i}
              title={ach.title}
              style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: `1px solid ${C.border}`, background: C.bg }}
            >
              <img src={ach.src} alt={ach.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, textAlign: "center", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: C.accentText, background: `${alpha(C.bg, "80")}` }}>
        View Profile →
      </div>
    </a>
  );
}
