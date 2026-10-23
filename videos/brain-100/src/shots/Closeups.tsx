import React, { useMemo } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { ease, rng, useClock } from "../components/anim";
import { Neurons, Tag } from "../components/Scene";
import { ACCENT, DISPLAY, MONO, T } from "../theme";

// Close-up shots for the 100% episode. Each fills the frame and animates from the shot start.
const Frame: React.FC<{ children: React.ReactNode; label?: string; bg?: string }> = ({ children, label, bg = "#040910" }) => (
  <AbsoluteFill style={{ backgroundColor: bg }}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">{children}</svg>
    {label && <Tag text={label} />}
  </AbsoluteFill>
);
const mono = { fontFamily: MONO } as const;
const display = { fontFamily: DISPLAY } as const;

// A brain made of lobes; level 10 = dim, 100 = every region lit, "reset" = fades back down.
export const Brain: React.FC<{ level: number | "reset" }> = ({ level }) => {
  const { t } = useClock();
  const lit = level === 100 ? ease(t, 0.1, 1.2) : level === "reset" ? 1 - ease(t, 0.4, 2.4) : 0.12;
  const lobes = [
    "M700 540 C620 380 760 240 920 260 C960 200 1080 210 1110 270 C1250 250 1330 380 1280 470 C1350 560 1290 700 1160 700 C1100 780 940 790 880 720 C740 740 650 650 700 540 Z",
  ];
  const r = useMemo(() => rng(7), []);
  const sparks = useMemo(() => Array.from({ length: 70 }, () => ({ x: 720 + r() * 560, y: 280 + r() * 440, p: r() * 6 })), [r]);
  const pct = level === "reset" ? Math.round(100 - 90 * ease(t, 0.4, 2.4)) : level === 100 ? Math.round(10 + 90 * ease(t, 0.1, 1.2)) : 10;
  return (
    <AbsoluteFill style={{ backgroundColor: T.bg0 }}>
      {level !== 10 && <Neurons opacity={0.35 * lit} />}
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="bglow"><stop offset="0" stopColor={ACCENT} stopOpacity={0.55 * lit} /><stop offset="1" stopColor={ACCENT} stopOpacity={0} /></radialGradient>
        </defs>
        <circle cx={1000} cy={500} r={520} fill="url(#bglow)" />
        {lobes.map((d, i) => <path key={i} d={d} fill="#1b1533" stroke={lit > 0.3 ? ACCENT : "#4b5563"} strokeWidth={8} />)}
        {["M820 300 C860 420 800 520 880 640", "M1000 270 C960 400 1060 470 1000 620", "M1160 300 C1120 420 1200 520 1140 660", "M760 480 C900 460 1050 520 1260 480"].map((d, i) => (
          <path key={i} d={d} stroke={lit > 0.3 ? "#c4b5fd" : "#374151"} strokeWidth={6} fill="none" opacity={0.8} />
        ))}
        {sparks.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={5} fill="#ede9fe" opacity={lit * Math.max(0, Math.sin(t * 7 + s.p))} />
        ))}
        <text x={1500} y={880} textAnchor="middle" style={display} fontSize={200} fill={lit > 0.3 ? ACCENT : T.dim}>{pct}%</text>
      </svg>
    </AbsoluteFill>
  );
};

export const Book: React.FC = () => {
  const { t } = useClock();
  const page = Math.min(900, Math.floor(interpolate(t, [0.3, 3], [1, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const flip = (t * 14) % 1;
  return (
    <Frame>
      <rect x={560} y={260} width={800} height={520} rx={12} fill="#2b2118" />
      <rect x={590} y={280} width={370} height={480} fill="#f4ecd8" />
      <rect x={960} y={280} width={370} height={480} fill="#efe5cc" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={620} x2={930} y1={320 + i * 34} y2={320 + i * 34} stroke="#b8a888" strokeWidth={6} />)}
      <path d={`M960 280 L${960 + 370 * (1 - 2 * flip)} ${280 - 30 * Math.sin(flip * Math.PI)} L${960 + 370 * (1 - 2 * flip)} ${760 - 30 * Math.sin(flip * Math.PI)} L960 760 Z`} fill="#fbf6ea" stroke="#d6c7a5" strokeWidth={3} />
      <text x={960} y={200} textAnchor="middle" style={mono} fontSize={56} fill={ACCENT}>PAGE {page} / 900</text>
      <text x={960} y={120} textAnchor="middle" style={mono} fontSize={40} fill={T.dim}>4 MINUTES</text>
    </Frame>
  );
};

export const Language: React.FC = () => {
  const { t } = useClock();
  const lines = ["こんにちは", "ありがとう", "私の名前はジョナです", "わかりました"];
  return (
    <Frame>
      {lines.map((l, i) => {
        const a = ease(t, 0.3 + i * 0.6);
        return (
          <g key={i} opacity={a} transform={`translate(${(1 - a) * -40} 0)`}>
            <text x={960} y={300 + i * 160} textAnchor="middle" fontFamily="'Noto Sans JP', sans-serif" fontSize={96} fill={i === 2 ? ACCENT : T.ink}>{l}</text>
          </g>
        );
      })}
      <text x={960} y={140} textAnchor="middle" style={mono} fontSize={40} fill={T.dim}>JAPANESE · 40 MINUTES</text>
    </Frame>
  );
};

export const Tiles: React.FC = () => {
  const { t } = useClock();
  const n = Math.floor(interpolate(t, [0.2, 2.4], [0, 1248], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const shown = Math.floor((n / 1248) * 96);
  return (
    <Frame>
      {Array.from({ length: 96 }, (_, i) => (
        <rect key={i} x={240 + (i % 16) * 90} y={160 + Math.floor(i / 16) * 90} width={84} height={84} fill={i < shown ? "rgba(167,139,250,0.35)" : "#111827"} stroke="#334155" strokeWidth={3} />
      ))}
      <text x={960} y={900} textAnchor="middle" style={display} fontSize={150} fill={T.ink}>{n.toLocaleString("en-US")}</text>
    </Frame>
  );
};

export const Chart: React.FC = () => {
  const { t } = useClock();
  const ring = ease(t, 1.0, 0.5);
  return (
    <Frame label="BED 4">
      <g transform="rotate(180 960 520)">
        <rect x={600} y={160} width={720} height={720} fill="#f4f1ea" />
        {["PATIENT: BED 4", "MEDICATION: HEPARIN", "DOSE: 50.0 ML/HR", "FREQ: CONTINUOUS"].map((l, i) => (
          <text key={i} x={650} y={280 + i * 110} style={mono} fontSize={40} fill="#333">{l}</text>
        ))}
      </g>
      <g opacity={ring}>
        <ellipse cx={1100} cy={556} rx={190} ry={60} fill="none" stroke={T.danger} strokeWidth={8} />
        <text x={1340} y={620} style={mono} fontSize={44} fill={T.danger}>SHOULD BE 5.0</text>
      </g>
    </Frame>
  );
};

export const Engine: React.FC<{ unknown?: boolean }> = ({ unknown }) => {
  const { t } = useClock();
  const pick = ease(t, 0.8, 0.4);
  return (
    <Frame>
      <rect x={480} y={340} width={960} height={360} rx={30} fill="#1f2937" stroke="#4b5563" strokeWidth={8} />
      {[0, 1, 2, 3].map((i) => {
        const bad = i === 2 && !unknown;
        const pulse = 0.5 + 0.5 * Math.sin(t * 10 + i);
        return (
          <g key={i}>
            <rect x={560 + i * 210} y={400} width={170} height={240} rx={16} fill={bad ? `rgba(255,75,75,${0.3 + 0.5 * pick * pulse})` : "#374151"} stroke={bad ? T.danger : "#6b7280"} strokeWidth={6} />
            <text x={645 + i * 210} y={540} textAnchor="middle" style={display} fontSize={90} fill={unknown ? T.dim : T.ink}>{unknown ? "?" : i + 1}</text>
          </g>
        );
      })}
      <text x={960} y={250} textAnchor="middle" style={mono} fontSize={40} fill={unknown ? T.dim : T.danger} opacity={pick}>{unknown ? "WHICH ONE?" : "CYLINDER 3 · MISFIRE"}</text>
    </Frame>
  );
};

export const Thermo: React.FC<{ hot?: boolean }> = ({ hot }) => {
  const { t } = useClock();
  const temp = interpolate(t, [0.2, 2], [37, hot ? 40 : 39.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h = interpolate(temp, [36, 41], [80, 560]);
  return (
    <Frame>
      <g transform="translate(0 -110)">
        <rect x={880} y={180} width={160} height={640} rx={80} fill="#0b1220" stroke="#94a3b8" strokeWidth={10} />
        <rect x={910} y={800 - h} width={100} height={h} rx={50} fill={temp > 39 ? T.danger : ACCENT} />
        <circle cx={960} cy={850} r={110} fill={temp > 39 ? T.danger : ACCENT} />
      </g>
      <text x={1280} y={560} style={display} fontSize={170} fill={T.ink}>{temp.toFixed(1)}°C</text>
      <text x={1290} y={640} style={mono} fontSize={36} fill={T.dim}>BRAIN TEMPERATURE</text>
      <text x={460} y={560} textAnchor="middle" style={display} fontSize={140} fill={ACCENT}>4×</text>
      <text x={460} y={630} textAnchor="middle" style={mono} fontSize={32} fill={T.dim}>ENERGY</text>
    </Frame>
  );
};

export const Hours: React.FC<{ value: number; sub?: string }> = ({ value, sub }) => {
  const { t } = useClock();
  const a = ease(t, 0.1, 0.5);
  const frac = value / 72;
  return (
    <Frame>
      <circle cx={960} cy={480} r={300} fill="none" stroke="#1f2937" strokeWidth={34} />
      <circle cx={960} cy={480} r={300} fill="none" stroke={value < 10 ? T.danger : ACCENT} strokeWidth={34} strokeDasharray={`${2 * Math.PI * 300 * frac * a} 4000`} transform="rotate(-90 960 480)" strokeLinecap="round" />
      <text x={960} y={560} textAnchor="middle" style={display} fontSize={260} fill={T.ink}>{value}</text>
      <text x={960} y={880} textAnchor="middle" style={mono} fontSize={44} fill={value < 10 ? T.danger : ACCENT} letterSpacing="0.12em">{sub ?? (value === 1 ? "HOUR LEFT" : "HOURS LEFT")}</text>
    </Frame>
  );
};

export const Damper: React.FC<{ on?: boolean; label?: string }> = ({ on, label }) => {
  const { t } = useClock();
  const glow = on ? ease(t, 0.3, 1) : 0;
  return (
    <Frame label={label}>
      <rect x={560} y={300} width={800} height={460} rx={40} fill="#e5e7eb" stroke="#94a3b8" strokeWidth={10} />
      <circle cx={960} cy={530} r={170} fill="#0b1220" stroke={on ? ACCENT : "#64748b"} strokeWidth={14} />
      <circle cx={960} cy={530} r={120 + 20 * Math.sin(t * 4) * glow} fill="none" stroke={ACCENT} strokeWidth={6} opacity={glow} />
      <rect x={640} y={680} width={640} height={50} rx={10} fill="#111827" />
      <text x={960} y={716} textAnchor="middle" style={mono} fontSize={30} fill={on ? T.ok : T.dim}>{on ? "VOICE ACCEPTED · RESET" : "VOICE AUTHORIZATION REQUIRED"}</text>
      <text x={960} y={240} textAnchor="middle" style={display} fontSize={80} fill="#c4b5fd" letterSpacing="0.1em">THE DAMPER</text>
    </Frame>
  );
};

export const Contract: React.FC = () => {
  const { t } = useClock();
  const zoom = interpolate(t, [0.4, 2], [1, 2.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0b0a" }}>
      <AbsoluteFill style={{ scale: zoom, transformOrigin: "62% 70%" }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%">
          <rect x={560} y={80} width={800} height={920} fill="#f4f1ea" />
          <text x={620} y={170} style={mono} fontSize={36} fill="#333">NEUROKANE · CONSENT FORM</text>
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={620} x2={1300} y1={240 + i * 34} y2={240 + i * 34} stroke="#bbb" strokeWidth={8} />)}
          <text x={900} y={810} style={mono} fontSize={13} fill="#555">14. The subject agrees to indefinite study.</text>
          <rect x={890} y={792} width={330} height={26} fill="none" stroke={T.danger} strokeWidth={3} opacity={ease(t, 1.8)} />
        </svg>
      </AbsoluteFill>
      <Tag text="2 · CLAUSE 14" />
    </AbsoluteFill>
  );
};

export const Keypad: React.FC<{ decode?: boolean }> = ({ decode }) => {
  const { t } = useClock();
  const code = [7, 2, 9, 1];
  return (
    <Frame label={decode ? undefined : "3 · FOUR TONES"}>
      {Array.from({ length: 12 }, (_, i) => {
        const n = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 0, -1][i];
        const hit = code.findIndex((c, k) => c === n && t > 0.4 + k * 0.6 && t < 0.9 + k * 0.6) >= 0;
        return (
          <g key={i}>
            <rect x={300 + (i % 3) * 170} y={200 + Math.floor(i / 3) * 170} width={150} height={150} rx={20} fill={hit ? ACCENT : "#1f2937"} stroke="#4b5563" strokeWidth={5} />
            {n >= 0 && <text x={375 + (i % 3) * 170} y={300 + Math.floor(i / 3) * 170} textAnchor="middle" style={display} fontSize={80} fill={T.ink}>{n}</text>}
          </g>
        );
      })}
      {code.map((c, k) => {
        const a = ease(t, 0.4 + k * 0.6, 0.3);
        const y = 300 + k * 150;
        return (
          <g key={k} opacity={a}>
            <path d={`M1000 ${y} q40 -40 80 0 t80 0 t80 0`} stroke={ACCENT} strokeWidth={6} fill="none" />
            <text x={1320} y={y + 20} style={mono} fontSize={48} fill={decode ? T.ink : T.dim}>{decode ? `TONE ${k + 1} → ${c}` : `TONE ${k + 1}`}</text>
          </g>
        );
      })}
    </Frame>
  );
};

export const Reflection: React.FC = () => {
  const { t } = useClock();
  const a = ease(t, 0.5, 1);
  return (
    <Frame label="5 · THE REFLECTION" bg="#05070d">
      <rect x={360} y={120} width={1200} height={800} fill="#0d1a2a" stroke="#334155" strokeWidth={12} />
      <g transform="translate(1920 0) scale(-1 1)" opacity={0.25 + 0.6 * a}>
        <rect x={700} y={300} width={520} height={260} rx={24} fill="#111827" />
        <text x={740} y={370} style={mono} fontSize={34} fill="#cbd5e1">To: Board</text>
        <text x={740} y={430} style={mono} fontSize={34} fill="#e9eef6">Found him. Our product</text>
        <text x={740} y={480} style={mono} fontSize={34} fill="#e9eef6">just walked in.</text>
      </g>
    </Frame>
  );
};

// The five words Kane says in five sentences, then cut together.
export const Splice: React.FC<{ word: number; assemble?: boolean }> = ({ word, assemble }) => {
  const { t } = useClock();
  const words = ["I AUTHORIZE", "DAMPER", "RESET", "RHETT KANE"];
  return (
    <Frame label={assemble ? "SPLICED" : `WORD ${Math.min(word + 1, 4)} / 4`}>
      {Array.from({ length: 64 }, (_, i) => {
        const h = 30 + 120 * Math.abs(Math.sin(i * 1.7 + t * 6));
        return <rect key={i} x={200 + i * 24} y={420 - h / 2} width={14} height={h} rx={6} fill="#334155" />;
      })}
      {words.map((w, i) => {
        const show = assemble ? ease(t, 0.3 + i * 0.4, 0.3) : i === word ? ease(t, 0.3, 0.4) : i < word ? 1 : 0;
        const active = assemble || i === word;
        return (
          <g key={i} opacity={show}>
            <rect x={200 + i * 390} y={640} width={360} height={110} rx={14} fill={active ? "rgba(167,139,250,0.25)" : "#111827"} stroke={ACCENT} strokeWidth={4} />
            <text x={380 + i * 390} y={712} textAnchor="middle" style={display} fontSize={64} fill={T.ink}>{w}</text>
          </g>
        );
      })}
    </Frame>
  );
};
