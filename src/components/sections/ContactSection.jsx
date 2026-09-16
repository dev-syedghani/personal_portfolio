import React, { useState } from "react";
import resumeData from "../../utils/resumeData";
import C, { alpha } from "../../theme";
import { IconDownload, IconForTech, getTechColor } from "../Icons";
import { FadeUp, Section } from "../UI";
import { socialLinks } from "../../data/sectionsData";

export function ContactSection() {
  const [state, setState] = useState("idle");
  const web3formsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  const submitMailto = (fd, form) => {
    const name = fd.get("name");
    const email = fd.get("email");
    const msg = fd.get("message");
    const type = fd.get("hiring_for");
    const subject = `[${type || "Portfolio"}] from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\nHiring for: ${type}\n\n${msg}`;
    window.location.href = `mailto:${resumeData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setState("success");
    setTimeout(() => {
      setState("idle");
      form.reset();
    }, 5000);
  };

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name");
    const email = fd.get("email");
    const msg = fd.get("message");
    const type = fd.get("hiring_for");
    setState("sending");

    if (web3formsKey) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: web3formsKey,
            name,
            email,
            message: msg,
            subject: `[${type || "Portfolio"}] from ${name}`,
            hiring_for: type,
            from_name: "Syed Ghani Portfolio",
          }),
        });
        const data = await res.json();
        if (data.success) {
          setState("success");
          e.target.reset();
          setTimeout(() => setState("idle"), 5000);
        } else {
          setState("error");
          setTimeout(() => setState("idle"), 4000);
        }
      } catch {
        setState("error");
        setTimeout(() => setState("idle"), 4000);
      }
      return;
    }

    setTimeout(() => submitMailto(fd, e.target), 400);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 14,
    background: C.bg,
    border: `1px solid ${C.border}`,
    color: C.primary,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "'Inter',sans-serif",
    boxSizing: "border-box",
  };

  return (
    <Section id="contact" label="08 / Contact" title="Let's Work Together" subtitle="I respond within 24 hours. No middlemen — just me." tinted watermark="CONTACT">
      <div className="contact-grid">
        <FadeUp>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.18em", color: C.secondary, marginBottom: 8 }}>Email</p>
              <a href={`mailto:${resumeData.email}`} style={{ color: C.accentText, textDecoration: "none", fontSize: 17, fontWeight: 600 }}>{resumeData.email}</a>
            </div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.18em", color: C.secondary, marginBottom: 8 }}>Direct Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="tel:+923090204019" style={{ color: C.primary, textDecoration: "none", fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <IconForTech name="phone" size={16} colored={true} /> +92 309 020 4019
                </a>
                <a href="https://wa.me/923090204019" target="_blank" rel="noreferrer" style={{ color: "var(--whatsapp)", textDecoration: "none", fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <IconForTech name="whatsapp" size={16} colored={true} /> WhatsApp Chat
                </a>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.18em", color: C.secondary, marginBottom: 8 }}>Location</p>
              <p style={{ color: C.primary, fontWeight: 600, margin: "0 0 4px" }}>Lahore, Pakistan · GMT+5</p>
              <p style={{ color: C.secondary, fontSize: 13, margin: 0 }}>Async-first. EU/US schedule overlap available.</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.18em", color: C.secondary, marginBottom: 12 }}>Profiles</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {socialLinks.map((link) => {
                  const brandColor = getTechColor(link.type);
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 14, color: C.primary, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = brandColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = C.primary)}
                    >
                      <IconForTech name={link.type} size={18} colored={true} />
                      {link.display || link.label}
                    </a>
                  );
                })}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.18em", color: C.secondary, marginBottom: 12 }}>Resume</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {resumeData.resumeDownloads.map((dl, i) => (
                  <a
                    key={i}
                    id={`resume-dl-${i}`}
                    href={dl.file}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      fontSize: 13,
                      color: C.primary,
                      textDecoration: "none",
                      background: C.surface,
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.copper;
                      e.currentTarget.style.color = C.accentText;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.color = C.primary;
                    }}
                  >
                    <IconDownload /> {dl.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={120}>
          <div className="glass" style={{ borderRadius: 20, padding: 36, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${alpha(C.copper, "60")}, transparent)` }} />
            <form id="contact-form" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.12em", color: C.secondary, marginBottom: 6 }}>Name</label>
                  <input
                    type="text"
                    name="name"
                    id="contact-name"
                    required
                    placeholder="Your name"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = C.copper)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.12em", color: C.secondary, marginBottom: 6 }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    id="contact-email"
                    required
                    placeholder="you@company.com"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = C.copper)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.12em", color: C.secondary, marginBottom: 6 }}>I'm hiring for</label>
                <select
                  name="hiring_for"
                  id="contact-hiring-for"
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={(e) => (e.target.style.borderColor = C.copper)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                >
                  <option value="">Select role type…</option>
                  <option>On-site / Hybrid (Lahore)</option>
                  <option>Remote — Full-time</option>
                  <option>Remote — Contract / Freelance</option>
                  <option>Other / Just exploring</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.12em", color: C.secondary, marginBottom: 6 }}>Message</label>
                <textarea
                  name="message"
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="Tell me about the role, project, or what you need…"
                  style={{ ...inputStyle, resize: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = C.copper)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>

              <button
                id="contact-submit"
                type="submit"
                disabled={state === "sending"}
                style={{
                  padding: "13px 28px",
                  borderRadius: 8,
                  border: "none",
                  cursor: state === "sending" ? "default" : "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "'Inter',sans-serif",
                  background: state === "success" ? `${alpha(C.sage, "20")}` : state === "error" ? `${alpha(C.copperDeep, "20")}` : C.primary,
                  color: state === "success" ? C.sage : state === "error" ? C.goldDeep : C.bg,
                  transition: "opacity 0.2s",
                }}
              >
                {state === "idle" && "Send Message →"}
                {state === "sending" && "Sending…"}
                {state === "success" && "✓ Message sent — I'll reply within 24h"}
                {state === "error" && "Failed — please email directly"}
              </button>
            </form>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
