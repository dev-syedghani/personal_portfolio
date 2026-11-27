import React from "react";
import SystemFlowchart from "../../components/SystemFlowchart";
import { SectionHead } from "../parts";

/**
 * The interactive stack topology, carried over from the previous site because a
 * flat grid of logo chips says far less than a diagram you can poke at: click a
 * node and it reports that technology's actual production role.
 *
 * SystemFlowchart predates this design and styles itself from the legacy token
 * set (--bg, --primary, --border-c, --accent …), which index.css still defines
 * in the old slate-blue. Rather than edit its ~470 lines, the wrapper below
 * re-points those same names at this design's emerald tokens, so the diagram
 * inherits the current palette and keeps following it through a theme switch.
 */
export function Toolbox() {
  return (
    <section className="sec" id="skills">
      <div className="wrap">
        <SectionHead
          eyebrow="Toolbox"
          title="The stack,"
          accent="wired the way I ship it."
          lead="Click any node to see what it actually does in production. Lines trace what talks to the core engine."
        />
        <div className="toolbox-bridge">
          <SystemFlowchart />
        </div>
      </div>
    </section>
  );
}
