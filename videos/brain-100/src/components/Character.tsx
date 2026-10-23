import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// House-style character as React SVG: navy egg head with a colored rim light, white pill
// eyes with expression lids, short jacket, thick haloed limbs. Limb swings, walking and
// breathing are driven by the current frame, so every frame renders deterministically.

export type CharSpec = {
  c: string;
  pose?: string;
  x: number; // percent of frame width
  face?: 1 | -1;
  mood?: string;
  glow?: string;
  kid?: boolean;
};

type Pose = {
  aF: [number, number]; aB: [number, number]; lF: [number, number]; lB: [number, number];
  swing?: number; period?: number; gesture?: boolean; wave?: boolean; head?: [number, number]; face?: string;
};
const POSES: Record<string, Pose> = {
  stand: { aF: [-10, -8], aB: [12, 6], lF: [-6, 4], lB: [6, 4] },
  walk: { aF: [-22, -15], aB: [22, -10], lF: [-22, 14], lB: [22, 6], swing: 22, period: 0.5 },
  run: { aF: [-50, -80], aB: [40, -70], lF: [-38, 30], lB: [34, 20], swing: 38, period: 0.32 },
  talk: { aF: [-45, -55], aB: [12, 6], lF: [-6, 4], lB: [6, 4], gesture: true, face: "talk" },
  point: { aF: [-88, -2], aB: [12, 6], lF: [-8, 4], lB: [8, 4], face: "smug" },
  wave: { aF: [-120, -55], aB: [12, 6], lF: [-6, 4], lB: [6, 4], wave: true, face: "happy" },
  sad: { aF: [3, 2], aB: [6, 2], lF: [-4, 2], lB: [4, 2], head: [6, 10], face: "sad" },
  hold: { aF: [-70, -25], aB: [-55, -30], lF: [-10, 4], lB: [10, 4] },
  cuffed: { aF: [28, -20], aB: [34, -20], lF: [-4, 2], lB: [4, 2], head: [6, 10], face: "sad" },
  hug: { aF: [-75, -70], aB: [-62, -80], lF: [-6, 4], lB: [6, 4], face: "happy" },
};

type Cast = { jacket: string; rim: string; scale: number; cap?: string; slick?: string; tie?: string; glasses?: string; coat?: boolean; mustache?: boolean; dim?: boolean };
const CAST: Record<string, Cast> = {
  jonah: { jacket: "#7c3aed", rim: "#a78bfa", scale: 0.97 },
  ray: { jacket: "#475569", rim: "#fbbf24", scale: 1.05, cap: "#b45309", mustache: true },
  okafor: { jacket: "#e2e8f0", rim: "#5eead4", scale: 0.95, glasses: "#e5e7eb", coat: true },
  kane: { jacket: "#374151", rim: "#e5e7eb", scale: 1.08, slick: "#9ca3af", tie: "#a78bfa" },
  guard: { jacket: "#26385a", rim: "#7d8ba3", scale: 1.05, cap: "#1a2740" },
  nurse: { jacket: "#60a5fa", rim: "#93c5fd", scale: 0.95 },
  guest: { jacket: "#3a4458", rim: "#5f6d84", scale: 0.95, dim: true },
};

const INK = "#121826";
const HALO = "rgba(200,215,240,0.45)";
const HIP = -100, SHOULDER = -188, HEAD = -262, GROUND = 880, W = 1920;

const Limb: React.FC<{ ox: number; oy: number; l1: number; l2: number; a1: number; a2: number; color: string; w: number }> = ({ ox, oy, l1, l2, a1, a2, color, w }) => {
  const ey = oy + l1;
  return (
    <g transform={`rotate(${a1} ${ox} ${oy})`}>
      <line x1={ox} y1={oy} x2={ox} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <g transform={`rotate(${a2} ${ox} ${ey})`}>
        <line x1={ox} y1={ey} x2={ox} y2={ey + l2} stroke={color} strokeWidth={w} strokeLinecap="round" />
        <circle cx={ox} cy={ey + l2} r={w * 0.62} fill={color} />
      </g>
    </g>
  );
};

const Face: React.FC<{ hx: number; hy: number; mood: string; glow?: string; talkOpen: number }> = ({ hx, hy, mood, glow, talkOpen }) => {
  const e1 = hx + 4, e2 = hx + 28, mx = hx + 16, my = hy + 18;
  const eye = (x: number) => (
    <g key={x}>
      <rect x={x - 7} y={hy - 22} width={14} height={24} rx={7} fill="#fff" />
      <circle cx={x + 2} cy={hy - 9} r={glow ? 5 : 4.5} fill={glow ?? INK} />
    </g>
  );
  return (
    <g>
      {eye(e1)}
      {eye(e2)}
      {mood === "smug" && <rect x={e1 - 9} y={hy - 26} width={e2 - e1 + 18} height={12} fill={INK} />}
      {mood === "sad" && <path d={`M${e1 - 10} ${hy - 28} L${e1 + 9} ${hy - 20} L${e1 + 9} ${hy - 30} Z M${e2 + 10} ${hy - 28} L${e2 - 9} ${hy - 20} L${e2 - 9} ${hy - 30} Z`} fill={INK} />}
      {mood === "talk" && <ellipse cx={mx} cy={my} rx={8} ry={2 + 5 * talkOpen} fill="#fff" />}
      {mood === "sad" && <path d={`M${mx - 9} ${my + 4} q9 -8 18 0`} stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />}
      {mood === "smug" && <path d={`M${mx - 8} ${my} q10 6 18 -4`} stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />}
      {mood === "happy" && <path d={`M${mx - 9} ${my - 2} q9 10 18 0`} stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />}
      {mood === "neutral" && <line x1={mx - 6} x2={mx + 6} y1={my} y2={my} stroke="#fff" strokeWidth={4} strokeLinecap="round" />}
    </g>
  );
};

export const Character: React.FC<{ spec: CharSpec; index: number }> = ({ spec, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cast = CAST[spec.c] ?? CAST.guest;
  const p = POSES[spec.pose ?? "stand"] ?? POSES.stand;
  const s = 1.3 * cast.scale * (spec.kid ? 0.72 : 1);
  const fc = spec.face ?? 1;
  const x = (spec.x / 100) * W;
  const [hdx, hdy] = p.head ?? [0, 0];
  const hx = hdx, hy = HEAD + hdy;
  const w = 15;

  // swings: sine waves on top of the static pose, phase-shifted for the opposite limbs
  const wave = (period: number, phase = 0) => Math.sin(((t / period) + phase) * Math.PI);
  const sw = p.swing ? p.swing * wave(p.period!) : 0;
  const armSw = p.swing ? -sw : p.gesture ? 12 * wave(0.7) : p.wave ? 4 * wave(0.4) : 0;
  const armLow = p.gesture ? 14 * wave(0.7, 0.3) : p.wave ? 24 * wave(0.4) : 0;
  const walkX = p.swing ? (spec.pose === "run" ? 200 : 110) * (t * 0.25) : 0;
  const bob = p.swing ? 0 : -5 * Math.abs(Math.sin((t / 1.1 + index * 0.3) * Math.PI));
  const talkOpen = Math.abs(Math.sin(t * Math.PI * 4));
  const mood = spec.mood ?? (spec.glow ? "smug" : p.face ?? "neutral");

  const limbs = (col: string, ww: number) => ({
    back: (
      <>
        <Limb ox={-8} oy={HIP} l1={52} l2={50} a1={p.lB[0] - sw} a2={p.lB[1]} color={col} w={ww} />
        <Limb ox={0} oy={SHOULDER} l1={50} l2={46} a1={p.aB[0] - armSw} a2={p.aB[1]} color={col} w={ww * 0.9} />
        <Limb ox={8} oy={HIP} l1={52} l2={50} a1={p.lF[0] + sw} a2={p.lF[1]} color={col} w={ww} />
      </>
    ),
    front: <Limb ox={0} oy={SHOULDER} l1={50} l2={46} a1={p.aF[0] + armSw} a2={p.aF[1] + armLow} color={col} w={ww * 0.9} />,
  });
  const halo = limbs(HALO, w + 7);
  const ink = limbs(INK, w);

  const torso = cast.coat
    ? <path d={`M-26 ${SHOULDER - 6} Q0 ${SHOULDER - 16} 26 ${SHOULDER - 6} L36 ${HIP + 18} Q0 ${HIP + 26} -36 ${HIP + 18} Z`} fill={cast.jacket} />
    : <path d={`M-24 ${SHOULDER - 6} Q0 ${SHOULDER - 16} 24 ${SHOULDER - 6} L30 ${HIP - 2} Q0 ${HIP + 8} -30 ${HIP - 2} Z`} fill={cast.jacket} />;

  return (
    <g opacity={cast.dim ? 0.75 : 1} transform={`translate(${x + walkX * fc} ${GROUND}) scale(${fc * s} ${s})`}>
      <g transform={`translate(0 ${bob})`}>
        {halo.back}
        {halo.front}
        {ink.back}
        {torso}
        {cast.tie && <><path d={`M-8 ${SHOULDER - 8} L0 ${SHOULDER + 4} L8 ${SHOULDER - 8} Z`} fill="#e9eef6" /><path d={`M0 ${SHOULDER} l-6 10 l6 44 l6 -44 z`} fill={cast.tie} /></>}
        {cast.coat && <path d={`M0 ${SHOULDER - 10} L0 ${HIP + 20}`} stroke="#94a3b8" strokeWidth={3} />}
        {cast.cap && <><path d={`M${hx - 44} ${hy - 30} Q${hx} ${hy - 84} ${hx + 44} ${hy - 30} Z`} fill={cast.cap} /><rect x={hx + 10} y={hy - 36} width={52} height={10} rx={5} fill={cast.cap} /></>}
        {cast.slick && <path d={`M${hx - 46} ${hy - 14} Q${hx - 20} ${hy - 72} ${hx + 44} ${hy - 30}`} stroke={cast.slick} strokeWidth={12} fill="none" strokeLinecap="round" />}
        <ellipse cx={hx} cy={hy} rx={48} ry={52} fill={INK} stroke={HALO} strokeWidth={4} />
        <path d={`M${hx - 30} ${hy - 40} A48 52 0 0 0 ${hx - 34} ${hy + 36}`} stroke={cast.rim} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
        <Face hx={hx} hy={hy} mood={mood} glow={spec.glow} talkOpen={talkOpen} />
        {cast.glasses && <><circle cx={hx + 4} cy={hy - 10} r={13} fill="none" stroke={cast.glasses} strokeWidth={4} /><circle cx={hx + 30} cy={hy - 10} r={13} fill="none" stroke={cast.glasses} strokeWidth={4} /></>}
        {cast.mustache && <path d={`M${hx + 6} ${hy + 10} q10 -6 20 0`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />}
        {ink.front}
      </g>
    </g>
  );
};
