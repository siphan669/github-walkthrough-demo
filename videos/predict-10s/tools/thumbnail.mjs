// Channel thumbnails (1280x720) for the 10-seconds episode: house-style Kai with glowing
// amber eyes, his amber "future ghost" already dodging a frozen bullet, the vault timer
// behind. Chunky outlined text top-left; bottom-right stays clear for YouTube's badge.
import { readFileSync } from "node:fs";
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { rng } from "./art.mjs";

const lilita = readFileSync("assets/fonts/lilita-one-latin-400-normal.woff2").toString("base64");
const AMBER = "#ffb547", INK = "#121826";

function head(cx, cy, s, { ghost = false } = {}) {
  // egg head, rim light, pill eyes with a smug lid, smirk — scaled around (cx, cy)
  const fill = ghost ? "rgba(255,181,71,0.18)" : INK;
  const stroke = ghost ? "rgba(255,181,71,0.8)" : "rgba(200,215,240,0.55)";
  const id = ghost ? "hc2" : "hc1";
  return `<g transform="translate(${cx} ${cy}) scale(${s}) translate(-345 -420)">
  <path d="M60 720 Q80 570 230 548 L450 548 Q600 570 620 720 Z" fill="${ghost ? "rgba(255,181,71,0.15)" : "#f59e0b"}" stroke="${ghost ? AMBER : "none"}" stroke-width="6" stroke-dasharray="${ghost ? "18 12" : "none"}"/>
  <ellipse cx="345" cy="420" rx="190" ry="206" fill="${fill}" stroke="${stroke}" stroke-width="8" stroke-dasharray="${ghost ? "18 12" : "none"}"/>
  ${ghost ? "" : `<path d="M225 260 A190 206 0 0 0 205 560" stroke="${AMBER}" stroke-width="16" fill="none" stroke-linecap="round" filter="url(#glow)"/>`}
  <clipPath id="${id}"><ellipse cx="345" cy="420" rx="186" ry="202"/></clipPath>
  <g clip-path="url(#${id})" opacity="${ghost ? 0.6 : 1}">
  <rect x="368" y="330" width="52" height="92" rx="26" fill="#ffffff"/>
  <rect x="456" y="330" width="52" height="92" rx="26" fill="#ffffff"/>
  <circle cx="400" cy="392" r="17" fill="${AMBER}"/>
  <circle cx="488" cy="392" r="17" fill="${AMBER}"/>
  <polygon points="356,310 530,310 530,350 356,362" fill="${ghost ? "rgba(255,181,71,0.0)" : INK}"/>
  <path d="M396 500 Q450 524 506 482" stroke="#ffffff" stroke-width="14" fill="none" stroke-linecap="round"/>
  </g></g>`;
}

function page({ big, sub, tag }) {
  const r = rng(21);
  let stars = "";
  for (let i = 0; i < 50; i++) stars += `<circle cx="${(r() * 1280) | 0}" cy="${(r() * 720) | 0}" r="${(r() * 1.5 + 0.4).toFixed(1)}" fill="#ffe2b0" opacity="${(0.2 + r() * 0.4).toFixed(2)}"/>`;
  const ticks = Array.from({ length: 60 }, (_, i) => `<line x1="1010" y1="${i % 5 ? 90 : 70}" x2="1010" y2="118" stroke="${AMBER}" stroke-opacity="0.5" stroke-width="${i % 5 ? 3 : 6}" transform="rotate(${i * 6} 1010 360)"/>`).join("");
  const svg = `<svg viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="warm" cx="0.28" cy="0.62" r="0.6"><stop offset="0" stop-color="#ff9a3c" stop-opacity="0.9"/><stop offset="0.5" stop-color="#7a3214" stop-opacity="0.4"/><stop offset="1" stop-color="#0b0d18" stop-opacity="0"/></radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0b14"/><stop offset="1" stop-color="#1b1420"/></linearGradient>
    <filter id="glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1280" height="720" fill="url(#sky)"/>${stars}
  <rect width="1280" height="720" fill="url(#warm)"/>
  <!-- vault door + clock ring behind -->
  <circle cx="1010" cy="360" r="300" fill="#151b24" stroke="#4a5a6e" stroke-width="16"/><circle cx="1010" cy="360" r="230" fill="none" stroke="#2c3644" stroke-width="10"/>${ticks}
  <rect x="890" y="300" width="240" height="110" rx="12" fill="#05080f" stroke="${C_RED}" stroke-width="5"/><text x="1010" y="380" text-anchor="middle" font-family="Lilita" font-size="80" fill="${C_RED}">0:10</text>
  <!-- bullet path: aimed at where Kai was; ghost has already moved -->
  <path d="M1150 424 L545 424" stroke="${AMBER}" stroke-width="6" stroke-dasharray="22 16"/>
  <g filter="url(#glow)"><rect x="1150" y="406" width="80" height="36" rx="6" fill="#b08a3a"/><path d="M1150 406 q-44 18 0 36 z" fill="#e0bd6a"/></g>
  ${head(735, 650, 0.55, { ghost: true })}
  ${head(345, 450, 1)}
  <circle cx="400" cy="422" r="26" fill="${AMBER}" opacity="0.45" filter="url(#glow)"/><circle cx="488" cy="422" r="26" fill="${AMBER}" opacity="0.45" filter="url(#glow)"/>
  <text x="650" y="525" font-family="Lilita" font-size="54" fill="${AMBER}" stroke="#000" stroke-width="8" paint-order="stroke">+10s</text>
  </svg>`;
  return `<html><head><style>
  @font-face { font-family: Lilita; src: url(data:font/woff2;base64,${lilita}); }
  body { margin:0; width:1280px; height:720px; position:relative; overflow:hidden; background:#000; }
  svg { position:absolute; inset:0; }
  .txt { position:absolute; left:34px; top:22px; font-family:Lilita; line-height:0.92; paint-order: stroke fill; -webkit-text-stroke: 14px #000; }
  .big { font-size:150px; color:#ffffff; text-shadow: 0 7px 0 #000, 0 0 40px rgba(255,181,71,0.55); letter-spacing:1px; }
  .sub { font-size:60px; color:${AMBER}; margin-top:4px; -webkit-text-stroke: 10px #000; text-shadow: 0 5px 0 #000; }
  .tag { position:absolute; right:60px; top:40px; font-family:Lilita; font-size:38px; color:#fff; background:${C_RED}; padding:4px 16px 6px; border:4px solid #000; transform:rotate(4deg); }
  </style></head><body>${svg}
  <div class="txt"><div class="big">${big}</div><div class="sub">${sub}</div></div>
  ${tag ? `<div class="tag">${tag}</div>` : ""}
  </body></html>`;
}
const C_RED = "#ff3b3b";

const variants = [
  { file: "out/thumbnail.png", big: "10 SEC", sub: "AHEAD OF YOU.", tag: "3:00 AM" },
  { file: "out/thumbnail-alt.png", big: "MISSED.", sub: "I SAW IT COMING.", tag: "3:00 AM" },
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
