// Channel thumbnails (1280x720) for the 100% brain episode: house-style Jonah with
// violet-glowing eyes in front of a fully lit brain. Chunky outlined text top-left;
// bottom-right stays clear for YouTube's duration badge.
import { readFileSync } from "node:fs";
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";

const lilita = readFileSync("public/fonts/lilita-one.woff2").toString("base64");
const V = "#a78bfa", INK = "#121826", RED = "#ff3b3b";

const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

function jonah(cx, cy, s) {
  return `<g transform="translate(${cx} ${cy}) scale(${s}) translate(-345 -420)">
  <path d="M60 720 Q80 570 230 548 L450 548 Q600 570 620 720 Z" fill="#7c3aed"/>
  <ellipse cx="345" cy="420" rx="190" ry="206" fill="${INK}" stroke="rgba(200,215,240,0.55)" stroke-width="8"/>
  <path d="M225 260 A190 206 0 0 0 205 560" stroke="${V}" stroke-width="16" fill="none" stroke-linecap="round" filter="url(#glow)"/>
  <clipPath id="hc"><ellipse cx="345" cy="420" rx="186" ry="202"/></clipPath>
  <g clip-path="url(#hc)">
  <rect x="368" y="330" width="52" height="92" rx="26" fill="#ffffff"/>
  <rect x="456" y="330" width="52" height="92" rx="26" fill="#ffffff"/>
  <circle cx="400" cy="392" r="17" fill="${V}" filter="url(#glow)"/>
  <circle cx="488" cy="392" r="17" fill="${V}" filter="url(#glow)"/>
  <polygon points="356,310 530,310 530,350 356,362" fill="${INK}"/>
  <path d="M396 500 Q450 524 506 482" stroke="#ffffff" stroke-width="14" fill="none" stroke-linecap="round"/>
  </g></g>`;
}

function brain(r) {
  let s = `<circle cx="960" cy="330" r="330" fill="url(#bglow)"/>`;
  // cerebellum + brainstem so the silhouette reads as a brain
  s += `<path d="M1010 440 C1080 450 1130 500 1090 540 C1050 575 990 560 975 520 Z" fill="#1b1533" stroke="${V}" stroke-width="8"/><path d="M955 470 C960 520 950 560 935 600" stroke="${V}" stroke-width="26" stroke-linecap="round" fill="none"/>`;
  s += `<path d="M700 330 C640 210 750 110 880 125 C915 80 1010 85 1035 130 C1150 115 1215 215 1175 285 C1230 355 1180 465 1075 465 C1025 525 900 535 850 480 C735 495 665 425 700 330 Z" fill="#1b1533" stroke="${V}" stroke-width="10" filter="url(#glow)"/>`;
  for (const d of ["M820 150 C850 250 800 330 860 430", "M960 120 C925 230 1010 290 960 420", "M1090 150 C1060 250 1120 330 1075 450", "M720 300 C850 285 990 330 1170 300"]) s += `<path d="${d}" stroke="#c4b5fd" stroke-width="7" fill="none"/>`;
  for (let i = 0; i < 46; i++) s += `<circle cx="${(720 + r() * 450) | 0}" cy="${(130 + r() * 340) | 0}" r="${(3 + r() * 4).toFixed(1)}" fill="#ede9fe" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
  return s;
}

function neurons(r) {
  const n = Array.from({ length: 40 }, () => [r() * 1280, r() * 720]);
  let s = "";
  n.forEach(([x, y], i) => n.slice(i + 1).forEach(([x2, y2]) => { if (Math.hypot(x - x2, y - y2) < 180) s += `<line x1="${x | 0}" y1="${y | 0}" x2="${x2 | 0}" y2="${y2 | 0}" stroke="${V}" stroke-opacity="0.25" stroke-width="2"/>`; }));
  n.forEach(([x, y]) => { s += `<circle cx="${x | 0}" cy="${y | 0}" r="4" fill="${V}" opacity="0.6"/>`; });
  return s;
}

function page({ big, sub, tag }) {
  const r = rng(41);
  const svg = `<svg viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="warm" cx="0.27" cy="0.65" r="0.6"><stop offset="0" stop-color="#8b5cf6" stop-opacity="0.65"/><stop offset="0.5" stop-color="#2e1065" stop-opacity="0.45"/><stop offset="1" stop-color="#07070f" stop-opacity="0"/></radialGradient>
    <radialGradient id="bglow"><stop offset="0" stop-color="${V}" stop-opacity="0.5"/><stop offset="1" stop-color="${V}" stop-opacity="0"/></radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07070f"/><stop offset="1" stop-color="#150d28"/></linearGradient>
    <filter id="glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1280" height="720" fill="url(#sky)"/>
  ${neurons(r)}
  <rect width="1280" height="720" fill="url(#warm)"/>
  <g transform="translate(60 70) scale(0.9)">${brain(r)}</g>
  ${jonah(330, 470, 0.95)}
  </svg>`;
  return `<html><head><style>
  @font-face { font-family: Lilita; src: url(data:font/woff2;base64,${lilita}); }
  body { margin:0; width:1280px; height:720px; position:relative; overflow:hidden; background:#000; }
  svg { position:absolute; inset:0; }
  .txt { position:absolute; left:34px; top:22px; font-family:Lilita; line-height:0.92; paint-order: stroke fill; -webkit-text-stroke: 14px #000; }
  .big { font-size:170px; color:#ffffff; text-shadow: 0 7px 0 #000, 0 0 40px rgba(167,139,250,0.6); letter-spacing:1px; }
  .sub { font-size:60px; color:${V}; margin-top:4px; -webkit-text-stroke: 10px #000; text-shadow: 0 5px 0 #000; }
  .tag { position:absolute; right:60px; top:40px; font-family:Lilita; font-size:38px; color:#fff; background:${RED}; padding:4px 16px 6px; border:4px solid #000; transform:rotate(4deg); }
  </style></head><body>${svg}
  <div class="txt"><div class="big">${big}</div><div class="sub">${sub}</div></div>
  ${tag ? `<div class="tag">${tag}</div>` : ""}
  </body></html>`;
}

const variants = [
  { file: "out/thumbnail.png", big: "100%", sub: "FOR 72 HOURS.", tag: "BRAIN OVERHEATING" },
  { file: "out/thumbnail-alt.png", big: "GENIUS.", sub: "THEN I CHOSE THIS.", tag: "72 HOURS LEFT" },
];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
for (const v of variants) {
  await p.setContent(page(v));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: v.file });
  console.log(v.file);
}
await b.close();
