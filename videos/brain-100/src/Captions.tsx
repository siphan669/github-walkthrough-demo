import type { Caption } from "@remotion/captions";
import React from "react";
import { Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ACCENT, DISPLAY } from "./theme";

// Burned-in captions for one voice line: 2–4 word chunks, the key word in the accent
// color, a small pop on each new chunk. Uses Interactive.captionsSchema so the inline
// caption array is editable in Studio's caption inspector.
const keyWord = (words: string[]) => {
  const num = words.findIndex((w) => /\d/.test(w));
  if (num >= 0) return num;
  return words.reduce((best, w, i, all) => (w.replace(/\W/g, "").length > all[best].replace(/\W/g, "").length ? i : best), 0);
};

const CaptionsInner: React.FC<{ captions: Caption[]; style?: React.CSSProperties }> = ({ captions, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const cap = captions.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!cap) return null;
  const words = cap.text.trim().split(/\s+/);
  const k = keyWord(words);
  const pop = interpolate(ms - cap.startMs, [0, 120], [0.86, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", ...style }}>
      <span style={{ fontFamily: DISPLAY, fontSize: 92, lineHeight: 1, textTransform: "uppercase", color: "#fff", letterSpacing: "0.02em", padding: "6px 26px 10px", background: "rgba(3,6,12,0.62)", borderRadius: 10, scale: pop }}>
        {words.map((w, i) => (
          <span key={i} style={{ color: i === k ? ACCENT : undefined }}>{i ? " " : ""}{w}</span>
        ))}
      </span>
    </div>
  );
};

export const Captions = Interactive.create({
  Component: CaptionsInner,
  layout: "none",
  schema: { ...Interactive.captionsSchema },
});
