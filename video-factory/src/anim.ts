import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0..1 progress through a scene's narration.
export const useNarrationProgress = (narrationStart: number, narrationFrames: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [narrationStart, narrationStart + Math.max(1, narrationFrames)], [0, 1], clamp);
};

// Springy 0..1 that starts at `delay` frames.
export const usePop = (delay = 0, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.6 } });
};

export const fadeIn = (frame: number, start: number, length = 15) =>
  interpolate(frame, [start, start + length], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

export const ease = (frame: number, input: [number, number], output: [number, number]) =>
  interpolate(frame, input, output, { ...clamp, easing: Easing.inOut(Easing.cubic) });

// Spread n reveals across the narration so visuals follow the voice.
export const revealTimes = (n: number, narrationStart: number, narrationFrames: number, tail = 0.15) => {
  const usable = narrationFrames * (1 - tail);
  return Array.from({ length: n }, (_, i) => Math.round(narrationStart + (usable * i) / Math.max(1, n)));
};
