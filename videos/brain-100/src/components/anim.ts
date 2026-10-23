import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// Small helpers shared by shot components. All timing is in seconds from the shot's start.
export const useClock = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  return { frame, fps, t, dur: durationInFrames / fps };
};

// 0 → 1 over `len` seconds starting at `delay`, eased out.
export const ease = (t: number, delay = 0, len = 0.6) =>
  interpolate(t, [delay, delay + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

// Seeded PRNG for deterministic decoration.
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};
