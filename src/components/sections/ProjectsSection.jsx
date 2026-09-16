import React, { useState } from "react";
import resumeData from "../../utils/resumeData";
import { FadeUp, Section } from "../UI";
import { ProjectModal } from "../ProjectModal";
import { IndexRow, PreviewPane } from "./CaseStudiesSection";

// Same numbered index-list + preview-pane browser as the case studies above —
// one consistent way of stepping through project archives on this page,
// rather than a second, differently-shaped carousel for "the smaller ones".
export function ProjectsSection() {
  const projects = resumeData.projects.map((p) => ({
    ...p,
    githubUrl: p.url,
    url: undefined,
  }));
  const [activeIdx, setActiveIdx] = useState(0);
  const [openProject, setOpenProject] = useState(null);
  const activeProject = projects[activeIdx];

  return (
    <Section id="projects" label="Work — Also Built" title="Personal Projects" subtitle="Side projects and academic work, built for practice — Docker/AWS deployments, GAN research, and more." watermark="PROJECTS">
      <FadeUp>
        <div className="project-browser">
          <div>
            {projects.map((p, i) => (
              <IndexRow key={p.name} project={p} index={i} isActive={i === activeIdx} onSelect={() => setActiveIdx(i)} />
            ))}
          </div>
          {activeProject && <PreviewPane project={activeProject} onOpen={() => setOpenProject(activeProject)} />}
        </div>
      </FadeUp>

      {openProject && <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />}
    </Section>
  );
}
