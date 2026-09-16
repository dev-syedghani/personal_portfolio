import React from "react";
import C from "../../theme";
import SystemFlowchart from "../SystemFlowchart";
import { Section } from "../UI";

// NOTE: SystemFlowchart measures node/connector positions via getBoundingClientRect()
// on mount (useLayoutEffect). Wrapping it in FadeUp (or anything else that applies its
// own mount-time transform) captures that measurement mid-animation, permanently
// desyncing the SVG connector lines from the actual node positions once the wrapper
// settles. Do not wrap this in FadeUp or any other entrance-animation component.
export function TechStackSection() {
  return (
    <Section id="tech-stack" label="Engineering — Architecture" title="System Topology" subtitle="Interactive flowchart — click any node to inspect its production role. Gold lines trace connections to the core engine." tinted watermark="STACK">
      <SystemFlowchart C={C} />
    </Section>
  );
}
