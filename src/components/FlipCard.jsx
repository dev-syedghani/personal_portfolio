import React, { useState } from "react";
import C from "../theme";
import { usePointerFine } from "../hooks/usePointerFine";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const faceStyle = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  borderRadius: 18,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

export function FlipCard({ front, back, className = "" }) {
  const [flipped, setFlipped] = useState(false);
  const pointerFine = usePointerFine();
  const reducedMotion = usePrefersReducedMotion();

  const handlers = pointerFine
    ? { onMouseEnter: () => setFlipped(true), onMouseLeave: () => setFlipped(false) }
    : { onClick: () => setFlipped((f) => !f) };

  return (
    <div
      className={className}
      {...handlers}
      style={{ position: "relative", perspective: 1400, cursor: pointerFine ? "default" : "pointer", zIndex: flipped ? 2 : 1 }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          transformStyle: "preserve-3d",
          transition: reducedMotion ? "none" : "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
          // The lift+scale (not just a flat rotateY) is what sells the card as
          // a physical pane of glass tipping toward the viewer, not a sprite
          // swap — it rises off the page mid-flip and settles back down.
          transform: flipped ? "rotateY(180deg) scale(1.05) translateZ(20px)" : "rotateY(0deg) scale(1) translateZ(0px)",
        }}
      >
        {/* front sits in normal flow — its natural content height sizes the whole card */}
        <div className="glass" style={{ ...faceStyle, position: "relative" }}>{front}</div>
        {/* back overlays the front's box exactly, flipped */}
        <div className="glass" style={{ ...faceStyle, position: "absolute", inset: 0, transform: "rotateY(180deg)" }}>{back}</div>
      </div>
    </div>
  );
}
