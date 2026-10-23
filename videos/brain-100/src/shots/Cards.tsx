import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { ease, useClock } from "../components/anim";
import { ACCENT, DISPLAY, MONO, T } from "../theme";

// Full-frame text shots: headline cards, clocks, chapter cards and the title card.
const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: T.bg0, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 18, textAlign: "center" }}>{children}</AbsoluteFill>
);

// Stepped "glitch" entrance used by headlines.
const Glitch: React.FC<{ delay?: number; children: React.ReactNode; style: React.CSSProperties }> = ({ delay = 0.15, children, style }) => {
  const { t } = useClock();
  const p = Math.floor(ease(t, delay, 0.35) * 5) / 5;
  return <div style={{ ...style, opacity: p, translate: `${(1 - p) * -30}px 0px`, transform: `skewX(${(1 - p) * 20}deg)` }}>{children}</div>;
};

export const TextCard: React.FC<{ big: string; sub?: string; bad?: boolean; cta?: boolean }> = ({ big, sub, bad, cta }) => {
  const { t } = useClock();
  const long = big.length > 13;
  return (
    <Center>
      <Glitch style={{ fontFamily: DISPLAY, fontSize: long ? 150 : 230, lineHeight: 0.9, color: bad ? T.danger : T.ink, maxWidth: 1700 }}>{big}</Glitch>
      {sub && <div style={{ fontFamily: MONO, fontSize: 44, letterSpacing: "0.14em", color: ACCENT, opacity: ease(t, 0.6), translate: `0px ${(1 - ease(t, 0.6)) * 30}px` }}>{sub}</div>}
      {cta && (
        <div style={{ display: "flex", gap: 40, marginTop: 30, opacity: ease(t, 1.4) }}>
          <div style={{ fontFamily: MONO, fontSize: 40, padding: "18px 40px", border: `4px solid ${T.ink}`, color: T.ink }}>👍 LIKE</div>
          <div style={{ fontFamily: MONO, fontSize: 40, padding: "18px 40px", background: T.danger, color: T.ink }}>SUBSCRIBE</div>
        </div>
      )}
    </Center>
  );
};

export const Clock: React.FC<{ time: string }> = ({ time }) => {
  const { t } = useClock();
  return (
    <Center>
      <div style={{ fontFamily: MONO, fontSize: 40, letterSpacing: "0.3em", color: T.dim, opacity: ease(t, 0) }}>TIME</div>
      <Glitch delay={0.1} style={{ fontFamily: MONO, fontSize: 220, color: T.ink }}>{time}</Glitch>
    </Center>
  );
};

export const ChapterCard: React.FC<{ n: number; title: string }> = ({ n, title }) => {
  const { t } = useClock();
  return (
    <Center>
      <div style={{ fontFamily: MONO, fontSize: 36, letterSpacing: "0.4em", color: ACCENT, opacity: ease(t, 0) }}>CHAPTER {n}</div>
      <div style={{ width: 520 * ease(t, 0.15), height: 4, background: ACCENT }} />
      <div style={{ fontFamily: DISPLAY, fontSize: 170, color: T.ink, opacity: ease(t, 0.3), translate: `0px ${(1 - ease(t, 0.3)) * 30}px` }}>{title}</div>
    </Center>
  );
};

export const TitleCard: React.FC<{ big: string; hero: string }> = ({ big, hero }) => {
  const { t } = useClock();
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  return (
    <Center>
      <div style={{ fontFamily: MONO, fontSize: 40, letterSpacing: "0.3em", color: T.dim, opacity: ease(t, 0.2) }}>{big}</div>
      <Glitch delay={0.6} style={{ fontFamily: DISPLAY, fontSize: 340, lineHeight: 0.9, color: ACCENT, textShadow: `0 0 ${60 * pulse}px ${ACCENT}99` }}>{hero}</Glitch>
      <div style={{ position: "absolute", left: interpolate(t, [0.6, 1.5], [-120, 2040], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), top: 0, width: 90, height: "100%", background: `linear-gradient(90deg, ${ACCENT}00, ${ACCENT}8c, ${ACCENT}00)` }} />
    </Center>
  );
};
