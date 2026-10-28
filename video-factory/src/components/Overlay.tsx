import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useLayout, useTheme } from "../context";
import type { VideoPlan } from "../types";

// Cinematic finishing layer drawn over every scene: vignette, light flicker,
// a thin progress bar and a channel tag.
export const Overlay: React.FC<{ plan: VideoPlan }> = ({ plan }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { vertical, width } = useLayout();
  const flicker = 0.03 * Math.sin(frame * 1.7) * Math.sin(frame * 0.37);
  const progress = frame / Math.max(1, plan.durationInFrames - 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: Math.max(0, flicker) }} />
      {plan.channel ? (
        <div
          style={{
            position: "absolute",
            top: vertical ? 120 : 40,
            right: vertical ? 60 : 56,
            fontFamily: theme.displayFont,
            fontSize: vertical ? 40 : 34,
            letterSpacing: "0.12em",
            color: theme.text,
            opacity: 0.55,
          }}
        >
          {plan.channel}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 6,
          width: width * progress,
          backgroundColor: theme.accent,
          opacity: 0.8,
        }}
      />
    </AbsoluteFill>
  );
};
