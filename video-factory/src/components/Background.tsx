import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { useLayout, useTheme } from "../context";
import type { BackgroundKind } from "../types";

// All randomness is seeded so every render of the same script is identical.

const Gradient: React.FC<{ top: string; bottom: string; shift?: number }> = ({ top, bottom, shift = 0 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at ${50 + shift}% 30%, ${top} 0%, ${bottom} 75%)`,
    }}
  />
);

const Stars: React.FC<{ count?: number; seed?: string }> = ({ count = 140, seed = "stars" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useLayout();
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: random(`${seed}x${i}`) * width,
        y: random(`${seed}y${i}`) * height,
        r: 0.6 + random(`${seed}r${i}`) * 2.2,
        speed: 0.05 + random(`${seed}s${i}`) * 0.25,
        phase: random(`${seed}p${i}`) * Math.PI * 2,
      })),
    [count, seed, width, height],
  );
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      {stars.map((s, i) => {
        const x = (s.x - frame * s.speed + width) % width;
        const o = 0.35 + 0.65 * Math.abs(Math.sin(frame / 25 + s.phase));
        return <circle key={i} cx={x} cy={s.y} r={s.r} fill="#fff" opacity={o} />;
      })}
    </svg>
  );
};

const Waves: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { width, height } = useLayout();
  const layers = [0, 1, 2, 3];
  const path = (layer: number) => {
    const base = height * (0.62 + layer * 0.09);
    const amp = 14 + layer * 8;
    const len = 380 + layer * 120;
    const speed = 0.6 + layer * 0.35;
    let d = `M 0 ${height} L 0 ${base}`;
    for (let x = 0; x <= width + 20; x += 20) {
      const y = base + Math.sin((x + frame * speed * 4) / len * Math.PI * 2) * amp
        + Math.sin((x - frame * speed * 2) / (len * 0.53) * Math.PI * 2) * amp * 0.35;
      d += ` L ${x} ${y.toFixed(1)}`;
    }
    return d + ` L ${width} ${height} Z`;
  };
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      {layers.map((l) => (
        <path key={l} d={path(l)} fill={color} opacity={0.25 + l * 0.17} />
      ))}
    </svg>
  );
};

const Fog: React.FC<{ tint: string }> = ({ tint }) => {
  const frame = useCurrentFrame();
  const blobs = [0, 1, 2, 3, 4];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {blobs.map((b) => {
        const x = ((random(`fx${b}`) * 140 + frame * (0.04 + b * 0.015)) % 160) - 30;
        const y = 20 + random(`fy${b}`) * 70;
        return (
          <div
            key={b}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: "70%",
              height: "45%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(ellipse, ${tint} 0%, transparent 65%)`,
              opacity: 0.18,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Grid: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { width, height } = useLayout();
  const horizon = height * 0.5;
  const lines = [];
  for (let i = 0; i < 18; i++) {
    const t = ((i + (frame / 40) % 1) / 18) ** 2;
    const y = horizon + t * (height - horizon);
    lines.push(<line key={`h${i}`} x1={0} x2={width} y1={y} y2={y} stroke={color} strokeWidth={1.5} opacity={t} />);
  }
  for (let i = -14; i <= 14; i++) {
    lines.push(
      <line key={`v${i}`} x1={width / 2 + i * 40} y1={horizon} x2={width / 2 + i * 260} y2={height} stroke={color} strokeWidth={1.2} opacity={0.35} />,
    );
  }
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      {lines}
    </svg>
  );
};

const Embers: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { width, height } = useLayout();
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      {Array.from({ length: 60 }, (_, i) => {
        const speed = 0.6 + random(`es${i}`) * 1.6;
        const y = height - ((random(`ey${i}`) * height + frame * speed) % (height + 40));
        const x = random(`ex${i}`) * width + Math.sin(frame / 30 + i) * 20;
        const r = 1.5 + random(`er${i}`) * 3;
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.25 + 0.5 * random(`eo${i}`)} />;
      })}
    </svg>
  );
};

const Paper: React.FC<{ tint: string }> = ({ tint }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 40%, ${tint} 0%, #000 120%)`,
      opacity: 0.9,
    }}
  />
);

const Lightning: React.FC = () => {
  const frame = useCurrentFrame();
  // A flash roughly every 4 seconds, at seeded moments.
  const cycle = Math.floor(frame / 120);
  const at = cycle * 120 + Math.floor(random(`lt${cycle}`) * 80);
  const o = interpolate(frame, [at, at + 2, at + 5, at + 7, at + 16], [0, 0.55, 0.1, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: "#cfe3ff", opacity: o }} />;
};

export const Background: React.FC<{ kind?: BackgroundKind }> = ({ kind = "fog" }) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const shift = Math.sin(frame / 200) * 10;
  switch (kind) {
    case "ocean":
      return (
        <AbsoluteFill>
          <Gradient top={theme.bgTop} bottom={theme.bgBottom} shift={shift} />
          <Stars count={70} seed="ocean" />
          <Waves color={theme.land} />
        </AbsoluteFill>
      );
    case "stars":
      return (
        <AbsoluteFill>
          <Gradient top={theme.bgTop} bottom={theme.bgBottom} shift={shift} />
          <Stars />
        </AbsoluteFill>
      );
    case "grid":
      return (
        <AbsoluteFill>
          <Gradient top={theme.bgTop} bottom={theme.bgBottom} shift={shift} />
          <Grid color={theme.accent} />
        </AbsoluteFill>
      );
    case "embers":
      return (
        <AbsoluteFill>
          <Gradient top={theme.bgTop} bottom={theme.bgBottom} shift={shift} />
          <Embers color={theme.accent} />
        </AbsoluteFill>
      );
    case "paper":
      return (
        <AbsoluteFill>
          <Paper tint={theme.land} />
          <Fog tint={theme.muted} />
        </AbsoluteFill>
      );
    case "storm":
      return (
        <AbsoluteFill>
          <Gradient top="#1b2533" bottom="#000" shift={shift} />
          <Fog tint="#9aa7b8" />
          <Waves color="#1a2433" />
          <Lightning />
        </AbsoluteFill>
      );
    case "fog":
    default:
      return (
        <AbsoluteFill>
          <Gradient top={theme.bgTop} bottom={theme.bgBottom} shift={shift} />
          <Fog tint={theme.muted} />
        </AbsoluteFill>
      );
  }
};
