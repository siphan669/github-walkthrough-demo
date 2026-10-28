import React from "react";
import { useCurrentFrame } from "remotion";
import { useTheme } from "../context";
import type { PropKind } from "../types";

// Simple vector props. Origin (0,0) is the bottom-centre of each prop,
// drawn roughly 200 units tall at scale 1.

const Ship: React.FC<{ c: string; sail: string }> = ({ c, sail }) => {
  const frame = useCurrentFrame();
  const rock = Math.sin(frame / 22) * 2.5;
  return (
    <g transform={`rotate(${rock} 0 -20)`}>
      <path d="M -170 -50 L 170 -50 L 135 0 L -140 0 Z" fill={c} stroke="#0b0f17" strokeWidth={4} />
      <rect x={-150} y={-62} width={300} height={12} fill={c} stroke="#0b0f17" strokeWidth={3} />
      <line x1={-55} y1={-62} x2={-55} y2={-330} stroke="#0b0f17" strokeWidth={7} />
      <line x1={60} y1={-62} x2={60} y2={-300} stroke="#0b0f17" strokeWidth={7} />
      {[[-55, -320, 95], [-55, -230, 110], [60, -290, 85], [60, -205, 100]].map(([x, y, w], i) => (
        <path
          key={i}
          d={`M ${x - w} ${y} Q ${x} ${y - 14} ${x + w} ${y} L ${x + w * 0.9} ${y + 78} Q ${x} ${y + 92} ${x - w * 0.9} ${y + 78} Z`}
          fill={sail}
          stroke="#0b0f17"
          strokeWidth={3}
          opacity={0.95}
        />
      ))}
      <path d="M 170 -55 L 250 -110" stroke="#0b0f17" strokeWidth={5} />
      <path d="M 60 -300 L 250 -110" stroke="#0b0f17" strokeWidth={2} />
      <path d="M -55 -330 L -55 -350 L -20 -342 Z" fill="#e5484d" />
    </g>
  );
};

const Barrel: React.FC<{ c: string }> = ({ c }) => (
  <g>
    <path d="M -45 0 Q -60 -60 -45 -120 L 45 -120 Q 60 -60 45 0 Z" fill={c} stroke="#0b0f17" strokeWidth={4} />
    {[-100, -60, -20].map((y) => (
      <path key={y} d={`M -52 ${y} Q 0 ${y + 8} 52 ${y}`} stroke="#3a2a1a" strokeWidth={6} fill="none" />
    ))}
    <ellipse cx={0} cy={-120} rx={45} ry={9} fill="#5c4127" stroke="#0b0f17" strokeWidth={3} />
  </g>
);

const Lifeboat: React.FC<{ c: string }> = ({ c }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(0 ${Math.sin(frame / 15) * 4}) rotate(${Math.sin(frame / 25) * 4})`}>
      <path d="M -110 -40 L 110 -40 Q 90 0 0 0 Q -90 0 -110 -40 Z" fill={c} stroke="#0b0f17" strokeWidth={4} />
      <line x1={-60} y1={-40} x2={-100} y2={10} stroke="#0b0f17" strokeWidth={5} />
      <line x1={60} y1={-40} x2={100} y2={10} stroke="#0b0f17" strokeWidth={5} />
    </g>
  );
};

const Question: React.FC<{ c: string }> = ({ c }) => {
  const frame = useCurrentFrame();
  const s = 1 + Math.sin(frame / 10) * 0.05;
  return (
    <text x={0} y={0} fontSize={240} textAnchor="middle" fill={c} fontFamily="'Bebas Neue'" transform={`scale(${s})`} style={{ filter: `drop-shadow(0 0 20px ${c})` }}>
      ?
    </text>
  );
};

const Lightbulb: React.FC<{ c: string }> = ({ c }) => {
  const frame = useCurrentFrame();
  const glow = 0.5 + 0.5 * Math.abs(Math.sin(frame / 12));
  return (
    <g>
      <circle cx={0} cy={-120} r={95} fill={c} opacity={0.18 * glow} />
      <path d="M -30 -40 Q -70 -90 -55 -135 Q -35 -185 0 -185 Q 35 -185 55 -135 Q 70 -90 30 -40 Z" fill={c} stroke="#0b0f17" strokeWidth={4} />
      <rect x={-28} y={-40} width={56} height={34} rx={6} fill="#9aa7b8" stroke="#0b0f17" strokeWidth={4} />
    </g>
  );
};

const Magnifier: React.FC<{ c: string }> = ({ c }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`rotate(${Math.sin(frame / 18) * 8} 0 -100)`}>
      <line x1={35} y1={-65} x2={95} y2={0} stroke="#6d5133" strokeWidth={22} strokeLinecap="round" />
      <circle cx={0} cy={-110} r={62} fill="rgba(180,220,255,0.25)" stroke={c} strokeWidth={14} />
    </g>
  );
};

const Compass: React.FC<{ c: string }> = ({ c }) => {
  const frame = useCurrentFrame();
  const needle = Math.sin(frame / 8) * 40 + Math.sin(frame / 3.1) * 15;
  return (
    <g transform="translate(0 -100)">
      <circle r={95} fill="#1b2533" stroke={c} strokeWidth={10} />
      <circle r={78} fill="none" stroke={c} strokeWidth={2} strokeDasharray="4 10" />
      <g transform={`rotate(${needle})`}>
        <path d="M 0 -70 L 12 0 L -12 0 Z" fill="#e5484d" />
        <path d="M 0 70 L 12 0 L -12 0 Z" fill="#f3efe6" />
      </g>
      <circle r={8} fill={c} />
    </g>
  );
};

const Scroll: React.FC<{ c: string }> = ({ c }) => (
  <g>
    <rect x={-80} y={-190} width={160} height={180} fill={c} stroke="#0b0f17" strokeWidth={4} />
    <rect x={-95} y={-205} width={190} height={22} rx={11} fill="#b08b5a" stroke="#0b0f17" strokeWidth={4} />
    <rect x={-95} y={-20} width={190} height={22} rx={11} fill="#b08b5a" stroke="#0b0f17" strokeWidth={4} />
    {[-160, -130, -100, -70].map((y) => (
      <line key={y} x1={-55} x2={55} y1={y} y2={y} stroke="#6d5133" strokeWidth={5} strokeLinecap="round" />
    ))}
  </g>
);

const LightningBolt: React.FC<{ c: string }> = ({ c }) => {
  const frame = useCurrentFrame();
  const o = frame % 40 < 6 ? 1 : 0.35;
  return <path d="M 20 -220 L -50 -90 L 0 -90 L -30 0 L 60 -130 L 10 -130 L 50 -220 Z" fill={c} opacity={o} />;
};

const Cloud: React.FC<{ c: string }> = ({ c }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${Math.sin(frame / 40) * 15} -60)`} fill={c} opacity={0.85}>
      <circle cx={-60} cy={0} r={45} />
      <circle cx={0} cy={-25} r={60} />
      <circle cx={65} cy={0} r={42} />
      <rect x={-60} y={0} width={125} height={45} />
    </g>
  );
};

const Skull: React.FC<{ c: string }> = ({ c }) => (
  <g transform="translate(0 -110)">
    <path d="M -70 0 Q -70 -80 0 -80 Q 70 -80 70 0 Q 70 30 40 40 L 40 70 L -40 70 L -40 40 Q -70 30 -70 0 Z" fill={c} stroke="#0b0f17" strokeWidth={4} />
    <circle cx={-28} cy={0} r={17} fill="#0b0f17" />
    <circle cx={28} cy={0} r={17} fill="#0b0f17" />
    <path d="M 0 22 L -8 36 L 8 36 Z" fill="#0b0f17" />
  </g>
);

const Book: React.FC<{ c: string }> = ({ c }) => (
  <g transform="translate(0 -20)">
    <path d="M 0 0 L -120 -20 L -120 -160 L 0 -140 Z" fill={c} stroke="#0b0f17" strokeWidth={4} />
    <path d="M 0 0 L 120 -20 L 120 -160 L 0 -140 Z" fill={c} stroke="#0b0f17" strokeWidth={4} />
    {[-110, -85, -60].map((y) => (
      <g key={y} stroke="#6d5133" strokeWidth={4}>
        <line x1={-95} y1={y - 12} x2={-20} y2={y} />
        <line x1={20} y1={y} x2={95} y2={y - 12} />
      </g>
    ))}
  </g>
);

export const PropShape: React.FC<{ kind: PropKind }> = ({ kind }) => {
  const theme = useTheme();
  switch (kind) {
    case "ship":
      return <Ship c="#6d4c33" sail="#efe3c8" />;
    case "barrel":
      return <Barrel c="#8a5a35" />;
    case "lifeboat":
      return <Lifeboat c="#9c6b43" />;
    case "question":
      return <Question c={theme.accent} />;
    case "lightbulb":
      return <Lightbulb c={theme.highlight} />;
    case "magnifier":
      return <Magnifier c={theme.accent} />;
    case "compass":
      return <Compass c={theme.accent} />;
    case "scroll":
      return <Scroll c="#efe3c8" />;
    case "lightning":
      return <LightningBolt c={theme.highlight} />;
    case "cloud":
      return <Cloud c="#55657a" />;
    case "skull":
      return <Skull c="#efe3c8" />;
    case "book":
      return <Book c="#efe3c8" />;
    default:
      return null;
  }
};
