import React, { useCallback, useEffect, useState } from "react";
import "./index.css";
import { GemStatsProvider } from "./context/GemStatsContext";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Preloader } from "./components/Preloader";
import {
  HeroSection,
  MetricsSection,
  RailsShowcaseSection,
  CaseStudiesSection,
  GemsSection,
  ProjectsSection,
  SkillsSection,
  ProcessSection,
  TechStackSection,
  GitHubSection,
  ExperienceSection,
  EducationSection,
  TestimonialsSection,
  AboutSection,
  ContactSection,
} from "./components/sections/index";

export default function App() {
  const [booting, setBooting] = useState(true);
  const finishBoot = useCallback(() => setBooting(false), []);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("portfolio-theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
    }
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  return (
    <GemStatsProvider>
      {/* Rendered alongside the app, never instead of it — the page lays out behind
          the splash so the reveal shows a settled layout rather than one still
          assembling itself. */}
      {booting && <Preloader onDone={finishBoot} />}
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--primary)", fontFamily: "'Inter',sans-serif" }}>
        <Nav theme={theme} toggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
        <main>
          <HeroSection />
          <MetricsSection />
          <CaseStudiesSection />
          <ProjectsSection />
          <RailsShowcaseSection />
          <TechStackSection />
          <SkillsSection />
          <ProcessSection />
          <GemsSection />
          <GitHubSection />
          <ExperienceSection />
          <TestimonialsSection />
          <AboutSection />
          <EducationSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </GemStatsProvider>
  );
}
