import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { useLayout, useTheme } from "../context";
import { StickFigure } from "../components/StickFigure";
import { Headline, PropsLayer, SceneFrame, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Ground: React.FC<{ kind: string; y: number; width: number; height: number }> = ({ kind, y, width, height }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  if (kind === "none") return null;
  if (kind === "deck") {
    return (
      <g>
        <rect x={0} y={y} width={width} height={height - y} fill="#4a3324" />
        {Array.from({ length: Math.ceil(width / 160) + 1 }, (_, i) => (
          <line key={i} x1={i * 160} x2={i * 160 - 60} y1={y} y2={height} stroke="#2e1f15" strokeWidth={4} />
        ))}
        <rect x={0} y={y} width={width} height={10} fill="#6d4c33" />
      </g>
    );
  }
  if (kind === "water") {
    let d = `M 0 ${height} L 0 ${y}`;
    for (let x = 0; x <= width + 20; x += 20) d += ` L ${x} ${y + Math.sin((x + frame * 3) / 60) * 8}`;
    return <path d={`${d} L ${width} ${height} Z`} fill={theme.land} opacity={0.9} />;
  }
  return (
    <g>
      <rect x={0} y={y} width={width} height={height - y} fill={theme.bgBottom} opacity={0.75} />
      <line x1={0} x2={width} y1={y} y2={y} stroke={theme.muted} strokeWidth={4} opacity={0.6} />
    </g>
  );
};

const Bubble: React.FC<{ text: string; x: number; y: number; appear: number }> = ({ text, x, y, appear }) => {
  const theme = useTheme();
  const { vertical } = useLayout();
  const fs = vertical ? 40 : 36;
  const w = Math.min(vertical ? 560 : 620, Math.max(160, text.length * fs * 0.55 + 60));
  const lines = Math.ceil((text.length * fs * 0.55) / (w - 60));
  const h = lines * fs * 1.25 + 40;
  if (appear <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${appear})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={26} fill="#fff" stroke="#0b0f17" strokeWidth={4} />
      <path d={`M -14 -2 L 0 30 L 18 -2 Z`} fill="#fff" stroke="#0b0f17" strokeWidth={4} strokeLinejoin="round" />
      <rect x={-18} y={-8} width={40} height={8} fill="#fff" />
      <foreignObject x={-w / 2 + 24} y={-h + 18} width={w - 48} height={h - 30}>
        <div style={{ fontFamily: theme.bodyFont, fontWeight: 700, fontSize: fs, lineHeight: 1.2, color: "#0b0f17", textAlign: "center" }}>
          {text}
        </div>
      </foreignObject>
    </g>
  );
};

export const StickScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { width, height, vertical, captionTop } = useLayout();
  const groundY = captionTop - (vertical ? 90 : 60); // leaves room for name labels above the captions
  const figScale = vertical ? 1.35 : 1.25;
  const figures = scene.figures?.length ? scene.figures : [{ pose: "idle" as const }];
  const ground = scene.ground ?? "land";

  return (
    <SceneFrame scene={scene} defaultBackground="fog" push={0.04}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <Ground kind={ground} y={groundY} width={width} height={height} />
      </svg>
      <PropsLayer props={scene.props} groundY={groundY} />
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {figures.map((f, i) => {
          const targetX = (f.x ?? (i + 1) / (figures.length + 1)) * width;
          const facing = f.facing ?? (targetX < width / 2 ? "right" : "left");
          const enter = f.enter ?? "walk";
          const delay = i * 8;
          const walkFrames = 40;
          let x = targetX;
          let pose = f.pose ?? "idle";
          let s = 1;
          if (enter === "walk") {
            const from = facing === "right" ? targetX - width * 0.35 : targetX + width * 0.35;
            const t = interpolate(frame, [delay, delay + walkFrames], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
            x = interpolate(t, [0, 1], [from, targetX]);
            if (t < 1) pose = "walk";
          } else if (enter === "pop") {
            s = spring({ frame: frame - delay, fps, config: { damping: 11 } });
          }
          const scale = figScale * (f.scale ?? 1) * s;
          const sayAt = scene.narrationStart + scene.narrationFrames * 0.15 + i * 25;
          const bubble = f.say ? spring({ frame: frame - sayAt, fps, config: { damping: 12 } }) : 0;
          const headY = groundY - 300 * scale;
          return (
            <g key={i}>
              <g transform={`translate(${x} ${groundY}) scale(${scale})`}>
                <StickFigure
                  pose={pose}
                  color={f.color ?? theme.figure}
                  hat={f.hat}
                  mood={f.mood}
                  facing={facing}
                  seed={i}
                />
              </g>
              {f.label ? (
                <text
                  x={x}
                  y={groundY + 42}
                  textAnchor="middle"
                  fontFamily={theme.bodyFont}
                  fontWeight={900}
                  fontSize={vertical ? 36 : 30}
                  fill={theme.accent}
                  opacity={interpolate(frame, [delay + 20, delay + 35], [0, 1], clamp)}
                  letterSpacing="0.1em"
                >
                  {f.label.toUpperCase()}
                </text>
              ) : null}
              {f.say ? <Bubble text={f.say} x={x + (facing === "right" ? 60 : -60)} y={headY - 20} appear={bubble} /> : null}
            </g>
          );
        })}
      </svg>
      <Headline text={scene.headline} />
    </SceneFrame>
  );
};
