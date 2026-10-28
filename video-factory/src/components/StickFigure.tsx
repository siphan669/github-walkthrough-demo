import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Hat, Mood, Pose } from "../types";

// A simple rigged stick figure. Origin (0,0) is between the feet; the figure
// is ~300 units tall at scale 1. Angles are degrees: 0 = straight down,
// positive = toward the direction the figure faces.

type Angles = {
  back: [number, number]; // arm behind the body: upper, fore (relative)
  front: [number, number];
  backLeg: [number, number];
  frontLeg: [number, number];
  lean: number;
  tilt: number;
  bob: number;
  jitter: number;
};

const poseAngles = (pose: Pose, t: number): Angles => {
  const base: Angles = {
    back: [-12, 10],
    front: [12, 10],
    backLeg: [-6, 0],
    frontLeg: [6, 0],
    lean: 0,
    tilt: 0,
    bob: Math.sin(t * 2.2) * 2,
    jitter: 0,
  };
  switch (pose) {
    case "walk": {
      const s = Math.sin(t * Math.PI * 2 * 1.4);
      return {
        ...base,
        back: [22 * s, 18],
        front: [-22 * s, 18],
        backLeg: [-26 * s, -18 * Math.max(0, s)],
        frontLeg: [26 * s, -18 * Math.max(0, -s)],
        bob: Math.abs(Math.cos(t * Math.PI * 2 * 1.4)) * -5,
        lean: 4,
      };
    }
    case "run": {
      const s = Math.sin(t * Math.PI * 2 * 2.2);
      return {
        ...base,
        back: [45 * s, 80],
        front: [-45 * s, 80],
        backLeg: [-45 * s, -50 * Math.max(0, s)],
        frontLeg: [45 * s, -50 * Math.max(0, -s)],
        bob: Math.abs(Math.cos(t * Math.PI * 2 * 2.2)) * -10,
        lean: 12,
      };
    }
    case "point":
      return { ...base, front: [92 + Math.sin(t * 3) * 3, 0], back: [-10, 12], tilt: -4 };
    case "think":
      return { ...base, front: [28, 128], back: [18, 82], tilt: 9 + Math.sin(t * 1.5) * 2 };
    case "shock":
      return {
        ...base,
        front: [155, 12],
        back: [-155, -12],
        backLeg: [-14, 0],
        frontLeg: [14, 0],
        jitter: Math.sin(t * 45) * 2.5,
        lean: -5,
      };
    case "shrug":
      return { ...base, front: [52, 95], back: [-52, -95], tilt: 10 * Math.sin(t * 2) };
    case "wave":
      return { ...base, front: [150, 25 * Math.sin(t * 9)], tilt: -5 };
    case "scared":
      return {
        ...base,
        front: [118, 62],
        back: [100, 72],
        lean: -8,
        jitter: Math.sin(t * 38) * 1.8,
        backLeg: [-12, 6],
        frontLeg: [10, 8],
      };
    case "cheer": {
      const b = Math.abs(Math.sin(t * 5));
      return { ...base, front: [150 + b * 10, 10], back: [-150 - b * 10, -10], bob: -b * 14 };
    }
    case "idle":
    default:
      return base;
  }
};

const limb = (
  x: number,
  y: number,
  a1: number,
  a2: number,
  l1: number,
  l2: number,
  dir: number,
): string => {
  const r = Math.PI / 180;
  const ex = x + Math.sin(a1 * r) * l1 * dir;
  const ey = y + Math.cos(a1 * r) * l1;
  const hx = ex + Math.sin((a1 + a2) * r) * l2 * dir;
  const hy = ey + Math.cos((a1 + a2) * r) * l2;
  return `M ${x} ${y} L ${ex.toFixed(1)} ${ey.toFixed(1)} L ${hx.toFixed(1)} ${hy.toFixed(1)}`;
};

const HatShape: React.FC<{ hat: Hat; dir: number }> = ({ hat, dir }) => {
  switch (hat) {
    case "captain":
      return (
        <g>
          <path d="M -30 -258 Q 0 -290 30 -258 Z" fill="#1d2b44" stroke="#0d1524" strokeWidth={3} />
          <rect x={-31} y={-262} width={62} height={10} rx={3} fill="#0d1524" />
          <path d={`M ${dir * 4} -262 L ${dir * 44} -254 L ${dir * 4} -252 Z`} fill="#0d1524" />
          <circle cx={0} cy={-272} r={5} fill="#f2b134" />
        </g>
      );
    case "sailor":
      return (
        <g>
          <ellipse cx={0} cy={-260} rx={30} ry={8} fill="#e8eef5" stroke="#9bb0c6" strokeWidth={2} />
          <path d="M -20 -261 Q 0 -288 20 -261 Z" fill="#e8eef5" stroke="#9bb0c6" strokeWidth={2} />
        </g>
      );
    case "detective":
      return (
        <g>
          <path d="M -32 -258 Q 0 -298 32 -258 Z" fill="#8a6a45" stroke="#5a4127" strokeWidth={3} />
          <ellipse cx={0} cy={-258} rx={40} ry={7} fill="#6d5133" />
        </g>
      );
    case "bow":
      return (
        <g transform={`translate(${-dir * 16} -262)`}>
          <path d="M 0 0 L -14 -10 L -14 10 Z M 0 0 L 14 -10 L 14 10 Z" fill="#ff6b8b" />
          <circle r={4} fill="#ff8fab" />
        </g>
      );
    default:
      return null;
  }
};

const Face: React.FC<{ mood: Mood; dir: number; blink: boolean; color: string }> = ({ mood, dir, blink, color }) => {
  const ex = dir * 8;
  const eye = (cx: number) =>
    blink ? (
      <line x1={cx - 4} x2={cx + 4} y1={-244} y2={-244} stroke="#0b0f17" strokeWidth={3} strokeLinecap="round" />
    ) : (
      <circle cx={cx} cy={-244} r={mood === "shocked" ? 5 : 3.6} fill="#0b0f17" />
    );
  const mouth = (() => {
    const mx = ex + dir * 2;
    switch (mood) {
      case "happy":
        return <path d={`M ${mx - 9} -229 Q ${mx} -219 ${mx + 9} -229`} stroke="#0b0f17" strokeWidth={3} fill="none" strokeLinecap="round" />;
      case "sad":
        return <path d={`M ${mx - 8} -224 Q ${mx} -232 ${mx + 8} -224`} stroke="#0b0f17" strokeWidth={3} fill="none" strokeLinecap="round" />;
      case "shocked":
        return <ellipse cx={mx} cy={-226} rx={5} ry={7} fill="#0b0f17" />;
      case "worried":
        return <path d={`M ${mx - 8} -226 Q ${mx - 3} -230 ${mx} -226 Q ${mx + 4} -222 ${mx + 8} -226`} stroke="#0b0f17" strokeWidth={3} fill="none" strokeLinecap="round" />;
      default:
        return <line x1={mx - 7} x2={mx + 7} y1={-226} y2={-226} stroke="#0b0f17" strokeWidth={3} strokeLinecap="round" />;
    }
  })();
  return (
    <g>
      <circle cx={0} cy={-240} r={28} fill={color} />
      {eye(ex - 8)}
      {eye(ex + 8)}
      {mood === "worried" || mood === "shocked" ? (
        <g stroke="#0b0f17" strokeWidth={2.5} strokeLinecap="round">
          <line x1={ex - 13} y1={-254} x2={ex - 4} y2={-257} />
          <line x1={ex + 4} y1={-257} x2={ex + 13} y2={-254} />
        </g>
      ) : null}
      {mouth}
    </g>
  );
};

export const StickFigure: React.FC<{
  pose?: Pose;
  color?: string;
  hat?: Hat;
  mood?: Mood;
  facing?: "left" | "right";
  seed?: number;
}> = ({ pose = "idle", color = "#f3efe6", hat = "none", mood = "neutral", facing = "right", seed = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + seed * 0.37;
  const a = poseAngles(pose, t);
  const dir = facing === "right" ? 1 : -1;
  const blink = (frame + seed * 23) % 95 < 4;
  const hip = -110;
  const shoulder = -190;
  const sw = 10;

  return (
    <g transform={`translate(${a.jitter} ${a.bob})`}>
      <g transform={`rotate(${a.lean * dir} 0 ${hip})`}>
        {/* back limbs, slightly dimmer for depth */}
        <g opacity={0.75} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d={limb(0, shoulder, a.back[0], a.back[1], 52, 50, dir)} />
          <path d={limb(0, hip, a.backLeg[0], a.backLeg[1], 56, 56, dir)} />
        </g>
        <g stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1={0} y1={-212} x2={0} y2={hip} />
          <path d={limb(0, hip, a.frontLeg[0], a.frontLeg[1], 56, 56, dir)} />
          <path d={limb(0, shoulder, a.front[0], a.front[1], 52, 50, dir)} />
        </g>
        <g transform={`rotate(${a.tilt * dir} 0 -215)`}>
          <Face mood={mood} dir={dir} blink={blink} color={color} />
          <HatShape hat={hat} dir={dir} />
        </g>
      </g>
    </g>
  );
};
