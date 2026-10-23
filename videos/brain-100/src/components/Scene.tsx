import React, { useMemo } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { BG as BG_TABLE, rng as artRng, svg } from "../lib/bgs.mjs";
import { ACCENT, MONO, T } from "../theme";
import { Character, CharSpec } from "./Character";
import { ease, rng, useClock } from "./anim";

// The shared art module is plain JS; give its background table a string index for lookups.
const BG = BG_TABLE as unknown as Record<string, (r: () => number, o: SceneSpec) => string>;

export type SceneSpec = {
  bg: string;
  chars?: CharSpec[];
  label?: string;
  neurons?: boolean;
  lightning?: boolean;
  impact?: boolean;
  siren?: boolean;
  flash?: boolean; // flashback grade
};

// Static scenery: rendered once per shot from the shared SVG generators.
const Backdrop: React.FC<{ bg: string; seed: number; spec: SceneSpec }> = ({ bg, seed, spec }) => {
  const html = useMemo(() => svg(BG[bg](artRng(seed), spec), ""), [bg, seed, spec]);
  return <AbsoluteFill style={{ filter: spec.flash ? "sepia(0.7) brightness(0.85)" : undefined }} dangerouslySetInnerHTML={{ __html: html }} />;
};

// Violet neuron network that flickers like it's firing.
export const Neurons: React.FC<{ seed?: number; opacity?: number }> = ({ seed = 3, opacity = 0.9 }) => {
  const { t } = useClock();
  const nodes = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 46 }, () => ({ x: r() * 1920, y: r() * 1080, p: r() * 6 }));
  }, [seed]);
  const edges = useMemo(() => nodes.flatMap((a, i) => nodes.slice(i + 1).filter((b) => Math.hypot(a.x - b.x, a.y - b.y) < 260).map((b) => [a, b] as const)), [nodes]);
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        {edges.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={ACCENT} strokeWidth={2} opacity={0.15 + 0.35 * Math.max(0, Math.sin(t * 5 + a.p + b.p))} />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={4 + 4 * Math.max(0, Math.sin(t * 6 + n.p))} fill={ACCENT} opacity={0.4 + 0.6 * Math.max(0, Math.sin(t * 6 + n.p))} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Lightning: React.FC = () => {
  const { t } = useClock();
  const strike = (at: number) => interpolate(t, [at, at + 0.05, at + 0.5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const a = Math.max(strike(0.4), strike(1.6) * 0.7);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#dfe7ff", opacity: a * 0.55 }} />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", opacity: a }}>
        <path d="M1240 0 L1180 260 L1260 280 L1150 560 L1230 580 L1100 880" stroke="#fff" strokeWidth={10} fill="none" />
      </svg>
    </AbsoluteFill>
  );
};

export const Impact: React.FC = () => {
  const { t } = useClock();
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(t, [0, 1.1], [1, 0], { extrapolateRight: "clamp" }) }} />;
};

const Siren: React.FC = () => {
  const { t } = useClock();
  const red = Math.max(0, Math.sin(t * Math.PI * 2));
  return <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(255,60,60,${0.25 * red}), rgba(60,110,255,${0.25 * (1 - red)}))` }} />;
};

export const Tag: React.FC<{ text: string }> = ({ text }) => {
  const { t } = useClock();
  const a = ease(t, 0.3);
  return (
    <div style={{ position: "absolute", top: 64, left: 80, padding: "12px 22px", border: `3px solid ${ACCENT}`, color: ACCENT, fontFamily: MONO, fontSize: 34, letterSpacing: "0.08em", background: "rgba(4,9,16,0.7)", opacity: a, translate: `0px ${(1 - a) * 30}px` }}>
      {text}
    </div>
  );
};

export const Scene: React.FC<{ spec: SceneSpec; seed: number }> = ({ spec, seed }) => (
  <AbsoluteFill style={{ backgroundColor: T.bg0 }}>
    <Backdrop bg={spec.bg} seed={seed} spec={spec} />
    {spec.neurons && <Neurons seed={seed} opacity={0.5} />}
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ filter: spec.flash ? "sepia(0.5)" : undefined }}>
        {(spec.chars ?? []).map((c, i) => <Character key={i} spec={c} index={i} />)}
      </svg>
    </AbsoluteFill>
    {spec.lightning && <Lightning />}
    {spec.siren && <Siren />}
    {spec.flash && <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(20,10,0,0.75) 100%)" }} />}
    {spec.label && <Tag text={spec.label} />}
    {spec.impact && <Impact />}
  </AbsoluteFill>
);
