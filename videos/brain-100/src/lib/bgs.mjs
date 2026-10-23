// Episode backgrounds, registered on the shared art module's BG table. Static SVG markup;
// anything that moves is a React overlay in src/components/.
import { BG, ground, rng, sky, svg } from "./art.mjs";

Object.assign(BG, {
  mri: () => sky("#0e1624", "#0a101b", "gmri") +
    `<rect x="560" y="200" width="800" height="560" rx="280" fill="#cbd5e1" stroke="#94a3b8" stroke-width="10"/><circle cx="960" cy="480" r="190" fill="#0b1220"/>` +
    `<rect x="760" y="560" width="900" height="70" rx="20" fill="#e2e8f0"/><rect x="1500" y="630" width="40" height="250" fill="#64748b"/>` +
    `<rect x="120" y="140" width="260" height="160" fill="#05080f" stroke="#334155" stroke-width="6"/><path d="M140 240 h60 l20 -40 l20 70 l20 -50 h100" stroke="#a78bfa" stroke-width="4" fill="none"/>` +
    ground("#0f1624"),
  garage: () => sky("#1c140c", "#120d08", "ggar") +
    `<rect x="100" y="120" width="760" height="560" fill="#2a2016" stroke="#4a3a28" stroke-width="10"/>` +
    Array.from({ length: 8 }, (_, i) => `<line x1="100" x2="860" y1="${190 + i * 66}" y2="${190 + i * 66}" stroke="#3a2c1e" stroke-width="5"/>`).join("") +
    `<rect x="980" y="160" width="820" height="260" fill="#1d1712" stroke="#4a3a28" stroke-width="6"/>` +
    Array.from({ length: 9 }, (_, i) => `<rect x="${1010 + i * 88}" y="200" width="16" height="${80 + (i % 3) * 30}" rx="6" fill="#9ca3af"/>`).join("") +
    `<path d="M1000 760 h560 l-40 -110 h-440 z" fill="#2563eb" stroke="#1e3a8a" stroke-width="6"/><circle cx="1110" cy="770" r="54" fill="#111"/><circle cx="1460" cy="770" r="54" fill="#111"/>` +
    `<rect x="1240" y="70" width="300" height="60" rx="8" fill="#0b0805" stroke="#fbbf24" stroke-width="4"/><text x="1390" y="112" text-anchor="middle" class="display" font-size="44" fill="#fbbf24">RAY'S AUTO</text>` +
    ground("#17110b"),
  lab: () => sky("#0b0d1a", "#090b14", "glab") +
    `<rect x="80" y="100" width="1760" height="520" fill="#0d1226" stroke="#2e3561" stroke-width="8"/>` +
    Array.from({ length: 6 }, (_, i) => `<rect x="${140 + i * 290}" y="150" width="230" height="140" rx="10" fill="#060915" stroke="#4c3fa6" stroke-width="4"/><path d="M${160 + i * 290} ${230} q40 -50 80 0 t80 0" stroke="#a78bfa" stroke-opacity="0.7" stroke-width="4" fill="none"/>`).join("") +
    `<rect x="760" y="360" width="400" height="60" rx="10" fill="#111633" stroke="#4c3fa6" stroke-width="4"/><text x="960" y="402" text-anchor="middle" class="display" font-size="44" fill="#c4b5fd" letter-spacing="8">NEUROKANE</text>` +
    ground("#0b0e1c"),
  suite: () => sky("#e6ebf2", "#c9d3df", "gsuite") +
    `<rect x="1300" y="200" width="420" height="420" fill="#0d1226" stroke="#94a3b8" stroke-width="12"/><text x="1510" y="420" text-anchor="middle" class="mono" font-size="28" fill="#64748b">OBSERVATION</text>` +
    `<rect x="160" y="300" width="220" height="580" fill="#94a3b8" stroke="#64748b" stroke-width="6"/><rect x="330" y="580" width="30" height="60" rx="6" fill="#ef4444"/>` +
    `<rect x="700" y="660" width="460" height="60" rx="12" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="4"/>` +
    ground("#b6c2d1"),
});

export { BG, rng, svg };
