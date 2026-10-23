import React from "react";
import { AbsoluteFill, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene, SceneSpec } from "./components/Scene";
import { ChapterCard, Clock, TextCard, TitleCard } from "./shots/Cards";
import { Book, Brain, Chart, Contract, Damper, Engine, Hours, Keypad, Language, Reflection, Splice, Thermo, Tiles } from "./shots/Closeups";

// One shot on the timeline. `v` is the visual spec from story/script.mjs; `cam` is a slow
// camera move across the shot's `seconds`. Timing props (from, durationInFrames, name) are
// provided by Interactive.create, so each shot is its own editable item in Studio.
export type Visual = { k: string; [key: string]: unknown };

const Camera: React.FC<{ cam?: string; seconds: number; children: React.ReactNode }> = ({ cam, seconds, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [0, seconds * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const moves: Record<string, [number, number, number, number]> = {
    push: [1, 1.07, 0, 0], pull: [1.08, 1, 0, 0], panL: [1.06, 1.06, 40, -40], panR: [1.06, 1.06, -40, 40], still: [1, 1.02, 0, 0],
  };
  const [s0, s1, x0, x1] = moves[cam ?? "still"] ?? moves.still;
  return <AbsoluteFill style={{ scale: s0 + (s1 - s0) * p, translate: `${x0 + (x1 - x0) * p}px 0px` }}>{children}</AbsoluteFill>;
};

// Fields a visual spec may carry, depending on its kind.
type VisualFields = {
  level: number | "reset"; unknown: boolean; hot: boolean; value: number; sub: string; on: boolean; label: string;
  decode: boolean; word: number; assemble: boolean; big: string; bad: boolean; cta: boolean; time: string;
  n: number; title: string; hero: string;
};

const render = (v: Visual, seed: number) => {
  const a = v as unknown as VisualFields;
  switch (v.k) {
    case "scene": return <Scene spec={v as unknown as SceneSpec} seed={seed} />;
    case "brain": return <Brain level={a.level} />;
    case "book": return <Book />;
    case "language": return <Language />;
    case "tiles": return <Tiles />;
    case "chart": return <Chart />;
    case "engine": return <Engine unknown={a.unknown} />;
    case "thermo": return <Thermo hot={a.hot} />;
    case "hours": return <Hours value={a.value} sub={a.sub} />;
    case "damper": return <Damper on={a.on} label={a.label} />;
    case "contract": return <Contract />;
    case "keypad": return <Keypad decode={a.decode} />;
    case "reflection": return <Reflection />;
    case "splice": return <Splice word={a.word} assemble={a.assemble} />;
    case "text": return <TextCard big={a.big} sub={a.sub} bad={a.bad} cta={a.cta} />;
    case "clock": return <Clock time={a.time} />;
    case "chapter": return <ChapterCard n={a.n} title={a.title} />;
    case "titlecard": return <TitleCard big={a.big} hero={a.hero} />;
  }
  throw new Error(`Unknown visual kind: ${v.k}`);
};

const STILL = new Set(["chapter", "titlecard", "text", "clock"]);

const ShotInner: React.FC<{ v: Visual; cam?: string; seconds: number; seed: number }> = ({ v, cam, seconds, seed }) =>
  STILL.has(v.k) ? render(v, seed) : <Camera cam={cam} seconds={seconds}>{render(v, seed)}</Camera>;

export const Shot = Interactive.create({ Component: ShotInner, layout: "absolute-fill" });
