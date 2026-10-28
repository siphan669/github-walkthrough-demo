import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { PropShape } from "../components/Props";
import { useLayout, useTheme } from "../context";
import { fadeIn, usePop } from "../anim";
import type { PlannedScene, SceneProp } from "../types";

export type SceneProps = { scene: PlannedScene };

// Background + slow camera push ("Ken Burns") shared by every scene.
export const SceneFrame: React.FC<{
  scene: PlannedScene;
  children: React.ReactNode;
  defaultBackground?: PlannedScene["background"];
  push?: number;
}> = ({ scene, children, defaultBackground = "fog", push = 0.05 }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, scene.durationInFrames], [1, 1 + push]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* background moves at half speed for a parallax feel */}
      <AbsoluteFill style={{ transform: `scale(${1 + (s - 1) * 0.5})` }}>
        <Background kind={scene.background ?? defaultBackground} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${s})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// The region between the top safe margin and the caption band.
export const ContentArea: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { padX, padTop, captionTop } = useLayout();
  return (
    <div
      style={{
        position: "absolute",
        left: padX,
        right: padX,
        top: padTop,
        height: captionTop - padTop - 30,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Headline: React.FC<{ text?: string; delay?: number }> = ({ text, delay = 4 }) => {
  const theme = useTheme();
  const { vertical, padX, padTop } = useLayout();
  const pop = usePop(delay, 16);
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: padX,
        right: vertical ? padX : undefined,
        top: padTop - (vertical ? 10 : 40),
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: pop,
        transform: `translateX(${(1 - pop) * -60}px)`,
      }}
    >
      <div style={{ width: 10, height: vertical ? 64 : 56, background: theme.accent, borderRadius: 4 }} />
      <div
        style={{
          fontFamily: theme.displayFont,
          fontSize: vertical ? 70 : 64,
          color: theme.text,
          letterSpacing: "0.04em",
          textShadow: "0 4px 18px rgba(0,0,0,0.6)",
          lineHeight: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const PropsLayer: React.FC<{ props?: SceneProp[]; groundY: number }> = ({ props, groundY }) => {
  const frame = useCurrentFrame();
  const { width, height, vertical } = useLayout();
  if (!props?.length) return null;
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
      {props.map((p, i) => {
        const x = (p.x ?? 0.5) * width;
        const y = p.y !== undefined ? p.y * height : groundY;
        const appear = fadeIn(frame, 6 + i * 8, 14);
        const sc = (p.scale ?? 1) * (vertical ? 1.15 : 1) * (0.7 + 0.3 * appear);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${sc})`} opacity={appear}>
            <PropShape kind={p.kind} />
            {p.label ? (
              <text y={44} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#f3efe6" stroke="#000" strokeWidth={6} paintOrder="stroke">
                {p.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

// Splits "a *highlighted* word" into styled spans.
export const RichText: React.FC<{ text: string; highlightColor: string }> = ({ text, highlightColor }) => {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? (
          <span key={i} style={{ color: highlightColor }}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};
