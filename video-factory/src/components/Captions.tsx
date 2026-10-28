import React, { useMemo } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout, useTheme } from "../context";
import type { CaptionWord } from "../types";

// Word-by-word captions. Words are grouped into short "chunks" by the planner;
// the spoken word pops, and words marked *like this* in the script are
// coloured as highlights.

export const Captions: React.FC<{ words: CaptionWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { vertical, captionTop, height, padX } = useLayout();

  const chunks = useMemo(() => {
    const map = new Map<number, CaptionWord[]>();
    for (const w of words) {
      if (!map.has(w.chunk)) map.set(w.chunk, []);
      map.get(w.chunk)!.push(w);
    }
    return [...map.values()];
  }, [words]);

  // Binary search for the chunk on screen now.
  let lo = 0;
  let hi = chunks.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (chunks[mid][0].start <= frame) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  if (found < 0) return null;
  const chunk = chunks[found];
  const chunkEnd = chunk[chunk.length - 1].end;
  if (frame > chunkEnd + 12) return null;

  const enter = spring({ frame: frame - chunk[0].start, fps, config: { damping: 14, mass: 0.5 } });
  const fontSize = vertical ? 76 : 62;

  return (
    <AbsoluteFill
      style={{
        top: captionTop,
        height: height - captionTop,
        justifyContent: vertical ? "flex-start" : "center",
        alignItems: "center",
        padding: `0 ${padX}px`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `${fontSize * 0.12}px ${fontSize * 0.26}px`,
          maxWidth: vertical ? 940 : 1500,
          transform: `scale(${0.85 + 0.15 * enter}) translateY(${(1 - enter) * 20}px)`,
          opacity: enter,
        }}
      >
        {chunk.map((w, i) => {
          const active = frame >= w.start && frame < w.end;
          const spoken = frame >= w.start;
          const pop = spring({ frame: frame - w.start, fps, config: { damping: 10, mass: 0.4 } });
          const color = w.highlight ? theme.highlight : theme.text;
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.bodyFont,
                fontWeight: 900,
                fontSize,
                lineHeight: 1.15,
                textTransform: "uppercase",
                letterSpacing: "0.01em",
                color: active && !w.highlight ? theme.bgBottom : color,
                background: active && !w.highlight ? theme.text : "transparent",
                borderRadius: 12,
                padding: "0 10px",
                opacity: spoken ? 1 : 0.55,
                transform: `scale(${active ? 1 + 0.12 * pop : 1})`,
                display: "inline-block",
                WebkitTextStroke: active && !w.highlight ? undefined : "2px rgba(0,0,0,0.85)",
                textShadow: active && !w.highlight
                  ? "none"
                  : w.highlight
                    ? `0 0 24px ${theme.highlight}88, 0 6px 0 rgba(0,0,0,0.7)`
                    : "0 6px 0 rgba(0,0,0,0.7)",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
