import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout, useTheme } from "../context";
import { fadeIn, usePop } from "../anim";
import { StickFigure } from "../components/StickFigure";
import { ContentArea, Headline, PropsLayer, RichText, SceneFrame, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const TitleScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { vertical, width, captionTop } = useLayout();
  const title = scene.title ?? "Untitled";
  const letters = [...title];
  const sweep = interpolate(frame, [20, 70], [-30, 130], clamp);
  return (
    <SceneFrame scene={scene} defaultBackground="ocean">
      <PropsLayer props={scene.props} groundY={captionTop - 10} />
      <ContentArea>
        {scene.kicker ? (
          <div
            style={{
              fontFamily: theme.bodyFont,
              fontWeight: 700,
              fontSize: vertical ? 40 : 34,
              letterSpacing: "0.35em",
              color: theme.accent,
              opacity: fadeIn(frame, 2, 20),
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {scene.kicker.toUpperCase()}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: theme.displayFont,
            fontSize: vertical ? 170 : 210,
            lineHeight: 0.92,
            color: theme.text,
            textAlign: "center",
            maxWidth: width * 0.86,
            filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.6))",
          }}
        >
          {letters.map((ch, i) => {
            const s = spring({ frame: frame - 6 - i * 1.5, fps, config: { damping: 14 } });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: s,
                  transform: `translateY(${(1 - s) * 60}px)`,
                  // a light sweep passes over the letters once
                  color: Math.abs(sweep - (i / letters.length) * 100) < 8 ? "#ffffff" : theme.text,
                  textShadow: Math.abs(sweep - (i / letters.length) * 100) < 8 ? `0 0 30px ${theme.accent}` : "none",
                }}
              >
                {ch === " " ? " " : ch}
              </span>
            );
          })}
        </div>
        {scene.subtitle ? (
          <div
            style={{
              marginTop: 26,
              fontFamily: theme.bodyFont,
              fontSize: vertical ? 46 : 42,
              color: theme.muted,
              opacity: fadeIn(frame, 35, 20),
              textAlign: "center",
            }}
          >
            {scene.subtitle}
          </div>
        ) : null}
      </ContentArea>
    </SceneFrame>
  );
};

export const TextScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { vertical } = useLayout();
  const words = (scene.headline ?? scene.title ?? "").split(" ");
  return (
    <SceneFrame scene={scene} defaultBackground="fog">
      <ContentArea>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px", maxWidth: vertical ? 900 : 1500 }}>
          {words.map((w, i) => {
            const s = spring({ frame: frame - 5 - i * 4, fps, config: { damping: 12 } });
            const hl = w.startsWith("*") && w.replace(/[^*]/g, "").length >= 1;
            return (
              <span
                key={i}
                style={{
                  fontFamily: theme.displayFont,
                  fontSize: vertical ? 130 : 150,
                  lineHeight: 1,
                  color: hl ? theme.highlight : theme.text,
                  transform: `scale(${s}) rotate(${(1 - s) * -8}deg)`,
                  display: "inline-block",
                  textShadow: "0 8px 30px rgba(0,0,0,0.6)",
                }}
              >
                {w.replace(/\*/g, "")}
              </span>
            );
          })}
        </div>
        {scene.body ? (
          <div
            style={{
              marginTop: 30,
              fontFamily: theme.bodyFont,
              fontSize: vertical ? 46 : 44,
              color: theme.muted,
              textAlign: "center",
              maxWidth: 1300,
              opacity: fadeIn(frame, 25, 20),
            }}
          >
            <RichText text={scene.body} highlightColor={theme.highlight} />
          </div>
        ) : null}
      </ContentArea>
    </SceneFrame>
  );
};

export const QuoteScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { vertical } = useLayout();
  const text = scene.text ?? "";
  // Typewriter paced to finish at ~60% of the narration.
  const typeEnd = scene.narrationStart + Math.max(30, scene.narrationFrames * 0.6);
  const chars = Math.round(interpolate(frame, [8, typeEnd], [0, text.length], clamp));
  const cursor = Math.floor(frame / 15) % 2 === 0;
  return (
    <SceneFrame scene={scene} defaultBackground="paper">
      <ContentArea>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 260, lineHeight: 0.5, color: theme.accent, opacity: 0.6, alignSelf: "flex-start" }}>“</div>
        <div
          style={{
            fontFamily: "Georgia, 'DejaVu Serif', serif",
            fontStyle: "italic",
            fontSize: vertical ? 62 : 66,
            lineHeight: 1.35,
            color: theme.text,
            maxWidth: vertical ? 920 : 1400,
            textAlign: "center",
            minHeight: "3em",
          }}
        >
          {text.slice(0, chars)}
          <span style={{ opacity: cursor && chars < text.length ? 1 : 0, color: theme.accent }}>|</span>
        </div>
        {scene.author ? (
          <div
            style={{
              marginTop: 34,
              fontFamily: theme.bodyFont,
              fontWeight: 700,
              fontSize: vertical ? 40 : 38,
              letterSpacing: "0.15em",
              color: theme.accent,
              opacity: fadeIn(frame, typeEnd, 20),
            }}
          >
            — {scene.author.toUpperCase()}
          </div>
        ) : null}
      </ContentArea>
    </SceneFrame>
  );
};

export const QuestionScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { vertical, width, height } = useLayout();
  const pop = usePop(4, 9);
  const glitch = random(`g${Math.floor(frame / 3)}`) > 0.86;
  const dx = glitch ? (random(`gx${frame}`) - 0.5) * 24 : 0;
  const text = scene.text ?? scene.headline ?? "?";
  const style: React.CSSProperties = {
    fontFamily: theme.displayFont,
    fontSize: vertical ? 120 : 140,
    lineHeight: 1,
    textAlign: "center",
    maxWidth: vertical ? 920 : 1500,
  };
  return (
    <SceneFrame scene={scene} defaultBackground="storm" push={0.08}>
      {/* drifting question marks */}
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {Array.from({ length: 14 }, (_, i) => {
          const x = random(`qx${i}`) * width;
          const y = height - ((random(`qy${i}`) * height + frame * (0.6 + random(`qs${i}`))) % height);
          return (
            <text key={i} x={x} y={y} fontSize={60 + random(`qf${i}`) * 120} fill={theme.accent} opacity={0.12} fontFamily="'Bebas Neue'">
              ?
            </text>
          );
        })}
      </svg>
      <ContentArea>
        <div style={{ position: "relative", transform: `scale(${0.6 + 0.4 * pop})`, opacity: pop }}>
          {glitch ? (
            <>
              <div style={{ ...style, position: "absolute", inset: 0, color: "#ff004c", transform: `translateX(${dx}px)`, opacity: 0.7 }}>
                {text.replace(/\*/g, "")}
              </div>
              <div style={{ ...style, position: "absolute", inset: 0, color: "#00e5ff", transform: `translateX(${-dx}px)`, opacity: 0.7 }}>
                {text.replace(/\*/g, "")}
              </div>
            </>
          ) : null}
          <div style={{ ...style, position: "relative", color: theme.text, textShadow: `0 0 40px ${theme.accent}55` }}>
            <RichText text={text} highlightColor={theme.highlight} />
          </div>
        </div>
      </ContentArea>
    </SceneFrame>
  );
};

export const OutroScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { vertical, width, captionTop } = useLayout();
  const pulse = 1 + 0.06 * Math.sin(frame / 6);
  const btn = usePop(30, 10);
  return (
    <SceneFrame scene={scene} defaultBackground="stars">
      <Headline text={scene.headline} />
      <svg width={width} height={captionTop} style={{ position: "absolute" }}>
        <g transform={`translate(${vertical ? width * 0.5 : width * 0.18} ${captionTop - 30}) scale(${vertical ? 1.1 : 1.3})`}>
          <StickFigure pose="wave" mood="happy" color={theme.figure} />
        </g>
      </svg>
      <ContentArea style={vertical ? { justifyContent: "flex-start", paddingTop: 80 } : { paddingLeft: width * 0.15 }}>
        <div style={{ fontFamily: theme.displayFont, fontSize: vertical ? 120 : 140, color: theme.text, textAlign: "center", lineHeight: 1, opacity: fadeIn(frame, 4, 20) }}>
          <RichText text={scene.title ?? "Thanks for watching"} highlightColor={theme.highlight} />
        </div>
        {scene.subtitle ? (
          <div style={{ marginTop: 20, fontFamily: theme.bodyFont, fontSize: vertical ? 44 : 42, color: theme.muted, textAlign: "center", opacity: fadeIn(frame, 18, 20) }}>
            {scene.subtitle}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 50,
            padding: "22px 54px",
            borderRadius: 18,
            background: theme.danger,
            color: "#fff",
            fontFamily: theme.bodyFont,
            fontWeight: 900,
            fontSize: vertical ? 54 : 50,
            letterSpacing: "0.08em",
            transform: `scale(${btn * pulse})`,
            boxShadow: `0 0 50px ${theme.danger}88`,
          }}
        >
          {(scene.cta ?? "Subscribe").toUpperCase()}
        </div>
      </ContentArea>
    </SceneFrame>
  );
};
