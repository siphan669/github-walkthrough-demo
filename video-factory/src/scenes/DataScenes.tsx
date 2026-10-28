import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout, useTheme } from "../context";
import { fadeIn, revealTimes } from "../anim";
import { WorldMap } from "../components/WorldMap";
import { ContentArea, Headline, PropsLayer, RichText, SceneFrame, type SceneProps } from "./common";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: n < 10 ? 1 : 0 });
// Animated count-up that stays a whole number when the target is one.
const countUp = (target: number, t: number) => fmt(Number.isInteger(target) ? Math.round(target * t) : target * t);

export const MapScene: React.FC<SceneProps> = ({ scene }) => {
  const { captionTop } = useLayout();
  return (
    <SceneFrame scene={scene} push={0.02}>
      <WorldMap
        center={scene.center}
        zoom={scene.zoom}
        markers={scene.markers}
        route={scene.route}
        highlightCountries={scene.highlightCountries}
        start={scene.narrationStart}
        frames={scene.narrationFrames}
      />
      <PropsLayer props={scene.props} groundY={captionTop} />
      <Headline text={scene.headline ?? scene.title} />
    </SceneFrame>
  );
};

export const TimelineScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { vertical, width, padX, padTop, captionTop } = useLayout();
  const events = scene.events ?? [];
  const times = revealTimes(events.length, scene.narrationStart, scene.narrationFrames);
  const active = times.filter((t) => frame >= t).length - 1;
  const lineT = interpolate(frame, [0, scene.narrationStart + scene.narrationFrames * 0.85], [0, 1], clamp);

  if (vertical) {
    const top = padTop + 130;
    const bottom = captionTop - 40;
    const x0 = padX + 40;
    const step = (bottom - top) / Math.max(1, events.length);
    return (
      <SceneFrame scene={scene} defaultBackground="paper">
        <Headline text={scene.headline ?? "Timeline"} />
        <div style={{ position: "absolute", left: x0 - 4, top, width: 8, height: (bottom - top) * lineT, background: theme.accent, borderRadius: 4 }} />
        {events.map((e, i) => {
          const s = spring({ frame: frame - times[i], fps, config: { damping: 13 } });
          const isActive = i === active;
          return (
            <div key={i} style={{ position: "absolute", left: x0 - 22, top: top + step * i + 10, display: "flex", gap: 34, alignItems: "flex-start", opacity: s, transform: `translateX(${(1 - s) * 60}px)` }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: isActive ? theme.highlight : theme.accent, border: `6px solid ${theme.bgBottom}`, flexShrink: 0, transform: `scale(${isActive ? 1.2 : 1})` }} />
              <div>
                <div style={{ fontFamily: theme.displayFont, fontSize: 64, color: isActive ? theme.highlight : theme.accent, lineHeight: 1 }}>{e.date}</div>
                <div style={{ fontFamily: theme.bodyFont, fontWeight: 700, fontSize: 38, color: theme.text, width: width - x0 - padX - 60, lineHeight: 1.2 }}>{e.label}</div>
              </div>
            </div>
          );
        })}
      </SceneFrame>
    );
  }

  const y = (padTop + captionTop) / 2 + 20;
  // keep the outer labels on screen: inset by half a label box
  const boxW = Math.min(360, (width - padX * 2) / Math.max(1, events.length - 1) * 1.6);
  const x0 = padX + boxW / 2 - 40;
  const x1 = width - padX - boxW / 2 + 40;
  const step = (x1 - x0) / Math.max(1, events.length - 1 || 1);
  return (
    <SceneFrame scene={scene} defaultBackground="paper">
      <Headline text={scene.headline ?? "Timeline"} />
      <div style={{ position: "absolute", left: x0, top: y - 4, height: 8, width: (x1 - x0) * lineT, background: theme.accent, borderRadius: 4 }} />
      {events.map((e, i) => {
        const s = spring({ frame: frame - times[i], fps, config: { damping: 13 } });
        const isActive = i === active;
        const above = i % 2 === 0;
        const cx = events.length === 1 ? (x0 + x1) / 2 : x0 + step * i;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: cx - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: isActive ? theme.highlight : theme.accent, border: `6px solid ${theme.bgBottom}`, transform: `scale(${s * (isActive ? 1.25 : 1)})` }} />
            <div style={{ position: "absolute", left: cx - 2, top: above ? y - 90 : y + 22, width: 4, height: 68 * s, background: theme.accent, opacity: 0.7 }} />
            <div
              style={{
                position: "absolute",
                left: cx - boxW / 2,
                width: boxW,
                top: above ? y - 300 : y + 100,
                height: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: above ? "flex-end" : "flex-start",
                textAlign: "center",
                opacity: s,
                transform: `translateY(${(1 - s) * (above ? 30 : -30)}px)`,
              }}
            >
              <div style={{ fontFamily: theme.displayFont, fontSize: 66, color: isActive ? theme.highlight : theme.accent, lineHeight: 1 }}>{e.date}</div>
              <div style={{ fontFamily: theme.bodyFont, fontWeight: 700, fontSize: 30, color: theme.text, lineHeight: 1.2 }}>{e.label}</div>
            </div>
          </React.Fragment>
        );
      })}
    </SceneFrame>
  );
};

export const ChartScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { vertical, width, padX, padTop, captionTop } = useLayout();
  const data = scene.data ?? [];
  const max = Math.max(1, ...data.map((d) => d.value));
  const kind = scene.chartType ?? "bar";
  const times = revealTimes(data.length, scene.narrationStart, scene.narrationFrames * 0.8);
  const unit = scene.unit ?? "";
  const top = padTop + (vertical ? 140 : 100);
  const bottom = captionTop - 30;

  let chart: React.ReactNode = null;
  if (kind === "bar") {
    const rowH = Math.min(vertical ? 150 : 110, (bottom - top) / Math.max(1, data.length));
    const labelW = vertical ? 330 : 420;
    const barMax = width - padX * 2 - labelW - 200;
    chart = data.map((d, i) => {
      const t = interpolate(frame, [times[i], times[i] + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      const color = d.color ?? theme.palette[i % theme.palette.length];
      return (
        <div key={i} style={{ position: "absolute", left: padX, top: top + i * rowH + ((bottom - top) - rowH * data.length) / 2, height: rowH, display: "flex", alignItems: "center", opacity: fadeIn(frame, times[i] - 5, 10) }}>
          <div style={{ width: labelW, paddingRight: 24, textAlign: "right", fontFamily: theme.bodyFont, fontWeight: 700, fontSize: vertical ? 36 : 34, color: theme.text, lineHeight: 1.1 }}>{d.label}</div>
          <div style={{ height: rowH * 0.62, width: Math.max(6, (barMax * d.value * t) / max), background: color, borderRadius: 10, boxShadow: `0 0 30px ${color}55` }} />
          <div style={{ marginLeft: 20, fontFamily: theme.displayFont, fontSize: vertical ? 64 : 60, color }}>{countUp(d.value, t)}{unit}</div>
        </div>
      );
    });
  } else if (kind === "line") {
    const left = padX + 60;
    const right = width - padX - 40;
    const n = data.length;
    const pts = data.map((d, i) => [left + ((right - left) * i) / Math.max(1, n - 1), bottom - 70 - ((bottom - top - 120) * d.value) / max] as const);
    const t = interpolate(frame, [scene.narrationStart, scene.narrationStart + scene.narrationFrames * 0.7], [0, 1], clamp);
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
    chart = (
      <svg width={width} height={captionTop} style={{ position: "absolute" }}>
        <line x1={left} x2={right} y1={bottom - 70} y2={bottom - 70} stroke={theme.muted} strokeWidth={3} opacity={0.5} />
        <path d={d} fill="none" stroke={theme.accent} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
        {pts.map((p, i) => {
          const shown = t * (n - 1) >= i - 0.01;
          return (
            <g key={i} opacity={shown ? 1 : 0}>
              <circle cx={p[0]} cy={p[1]} r={12} fill={theme.highlight} />
              <text x={p[0]} y={p[1] - 26} textAnchor="middle" fontFamily="'Bebas Neue'" fontSize={48} fill={theme.text}>{fmt(data[i].value)}{unit}</text>
              <text x={p[0]} y={bottom - 25} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={vertical ? 30 : 28} fill={theme.muted}>{data[i].label}</text>
            </g>
          );
        })}
      </svg>
    );
  } else {
    const total = data.reduce((a, d) => a + d.value, 0) || 1;
    const r = Math.min(vertical ? 300 : 250, (bottom - top) / 2 - 20);
    const cx = vertical ? width / 2 : padX + r + 80;
    const cy = vertical ? top + r + 20 : (top + bottom) / 2;
    const t = interpolate(frame, [scene.narrationStart, scene.narrationStart + scene.narrationFrames * 0.6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const C = 2 * Math.PI * r;
    let acc = 0;
    chart = (
      <>
        <svg width={width} height={captionTop} style={{ position: "absolute" }}>
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {data.map((d, i) => {
              const frac = d.value / total;
              const seg = Math.max(0, Math.min(frac, t - acc)) * C;
              const off = -acc * C;
              acc += frac;
              return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color ?? theme.palette[i % theme.palette.length]} strokeWidth={r * 0.38} strokeDasharray={`${seg} ${C}`} strokeDashoffset={off} />;
            })}
          </g>
        </svg>
        <div style={{ position: "absolute", left: vertical ? padX : cx + r + 120, top: vertical ? cy + r + 60 : cy - data.length * 40, display: "flex", flexDirection: "column", gap: 16 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: fadeIn(frame, times[i], 12) }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: d.color ?? theme.palette[i % theme.palette.length] }} />
              <div style={{ fontFamily: theme.bodyFont, fontWeight: 700, fontSize: 38, color: theme.text }}>
                {d.label} <span style={{ color: theme.muted }}>{Math.round((d.value / total) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <SceneFrame scene={scene} defaultBackground="grid" push={0.02}>
      <Headline text={scene.headline ?? scene.title} />
      {chart}
    </SceneFrame>
  );
};

export const StatScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { vertical, captionTop } = useLayout();
  const value = scene.value ?? 0;
  const t = interpolate(frame, [8, 8 + fps * 1.6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shown = `${scene.prefix ?? ""}${countUp(value, 1)}${scene.suffix ?? ""}`;
  const numberSize = (vertical ? 210 : 190) * Math.min(1, 5 / Math.max(5, shown.length));
  const ring = spring({ frame: frame - 4, fps, config: { damping: 20 } });
  const size = vertical ? 620 : 520;
  return (
    <SceneFrame scene={scene} defaultBackground="embers">
      <PropsLayer props={scene.props} groundY={captionTop} />
      <Headline text={scene.headline} />
      <ContentArea>
        <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={size} height={size} style={{ position: "absolute", transform: `rotate(${frame * 0.4}deg)` }}>
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 14} fill="none" stroke={theme.accent} strokeWidth={6} strokeDasharray="30 18" opacity={0.6 * ring} />
          </svg>
          <svg width={size} height={size} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 40} fill="none" stroke={theme.highlight} strokeWidth={14} strokeDasharray={`${ring * Math.PI * (size - 80)} 9999`} strokeLinecap="round" />
          </svg>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: theme.displayFont, fontSize: numberSize, color: theme.text, lineHeight: 0.9 }}>
              {scene.prefix ?? ""}
              {countUp(value, t)}
              {scene.suffix ?? ""}
            </div>
            <div style={{ fontFamily: theme.bodyFont, fontWeight: 700, fontSize: vertical ? 40 : 36, color: theme.accent, maxWidth: size - 120, margin: "10px auto 0", opacity: fadeIn(frame, 30, 15), letterSpacing: "0.05em" }}>
              {(scene.label ?? "").toUpperCase()}
            </div>
          </div>
        </div>
      </ContentArea>
    </SceneFrame>
  );
};

export const ListScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { vertical } = useLayout();
  const items = scene.items ?? [];
  const times = revealTimes(items.length, scene.narrationStart, scene.narrationFrames);
  const active = times.filter((t) => frame >= t).length - 1;
  return (
    <SceneFrame scene={scene} defaultBackground="fog">
      <Headline text={scene.headline ?? scene.title} />
      <ContentArea style={{ alignItems: "stretch", paddingTop: vertical ? 120 : 70 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: vertical ? 26 : 20 }}>
          {items.map((it, i) => {
            const s = spring({ frame: frame - times[i], fps, config: { damping: 14 } });
            const isActive = i === active;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  padding: vertical ? "22px 28px" : "16px 28px",
                  borderRadius: 18,
                  background: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                  border: `3px solid ${isActive ? theme.accent : "transparent"}`,
                  opacity: s * (isActive || i > active ? 1 : 0.6),
                  transform: `translateX(${(1 - s) * 120}px)`,
                }}
              >
                <div style={{ fontFamily: theme.displayFont, fontSize: vertical ? 76 : 64, color: theme.accent, width: 70, textAlign: "center" }}>{i + 1}</div>
                <div style={{ fontFamily: theme.bodyFont, fontWeight: 700, fontSize: vertical ? 44 : 42, color: theme.text, lineHeight: 1.2 }}>
                  <RichText text={it} highlightColor={theme.highlight} />
                </div>
              </div>
            );
          })}
        </div>
      </ContentArea>
    </SceneFrame>
  );
};
