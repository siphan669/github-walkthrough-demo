// Channel thumbnails (1280x720) for the death-timers episode: house-style Lena with
// rose-glowing eyes facing a crowd whose timers all read the same time.
// Chunky outlined text top-left; bottom-right stays clear for YouTube's duration badge.
import { readFileSync } from "node:fs";
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { rng } from "./art.mjs";

const lilita = readFileSync("assets/fonts/lilita-one-latin-400-normal.woff2").toString("base64");
const ROSE = "#ff6b81", INK = "#121826", RED = "#ff3b3b";

function lena(cx, cy, s) {
  return `<g transform="translate(${cx} ${cy}) scale(${s}) translate(-345 -420)">
  <path d="M60 720 Q80 570 230 548 L450 548 Q600 570 620 720 Z" fill="#be123c"/>
  <ellipse cx="345" cy="420" rx="190" ry="206" fill="${INK}" stroke="rgba(200,215,240,0.55)" stroke-width="8"/>
  <path d="M225 260 A190 206 0 0 0 205 560" stroke="${ROSE}" stroke-width="16" fill="none" stroke-linecap="round" filter="url(#glow)"/>
  <clipPath id="hc"><ellipse cx="345" cy="420" rx="186" ry="202"/></clipPath>
  <g clip-path="url(#hc)">
  <rect x="368" y="330" width="52" height="92" rx="26" fill="#ffffff"/>
  <rect x="456" y="330" width="52" height="92" rx="26" fill="#ffffff"/>
  <circle cx="400" cy="372" r="17" fill="${ROSE}" filter="url(#glow)"/>
  <circle cx="488" cy="372" r="17" fill="${ROSE}" filter="url(#glow)"/>
  <path d="M400 500 q48 -18 96 0" stroke="#ffffff" stroke-width="14" fill="none" stroke-linecap="round"/>
  </g></g>`;
}

function crowd(r, time) {
  // three rows of small heads, each with the same timer; one odd one out
  let s = "";
  const rows = [[640, 430, 0.9], [610, 560, 1], [580, 700, 1.1]];
  rows.forEach(([x0, y, sc], row) => {
    for (let i = 0; i < 5; i++) {
      const x = x0 + i * 135 + (row % 2) * 60;
      const jacket = ["#2563eb", "#16a34a", "#a16207", "#7c3aed", "#0891b2"][(i + row) % 5];
      s += `<g transform="translate(${x} ${y}) scale(${sc})"><rect x="-30" y="10" width="60" height="70" rx="18" fill="${jacket}"/><circle cx="0" cy="-20" r="36" fill="${INK}" stroke="rgba(200,215,240,0.45)" stroke-width="4"/><rect x="-6" y="-30" width="8" height="14" rx="4" fill="#fff"/><rect x="10" y="-30" width="8" height="14" rx="4" fill="#fff"/>` +
        `<rect x="-62" y="-104" width="124" height="38" rx="8" fill="rgba(12,4,10,0.9)" stroke="${ROSE}" stroke-width="3"/><text x="0" y="-77" text-anchor="middle" font-family="Lilita" font-size="24" fill="${ROSE}">${time}</text></g>`;
    }
  });
  return s;
}

function page({ big, sub, tag, time }) {
  const r = rng(31);
  let stars = "";
  for (let i = 0; i < 50; i++) stars += `<circle cx="${(r() * 1280) | 0}" cy="${(r() * 300) | 0}" r="${(r() * 1.5 + 0.4).toFixed(1)}" fill="#ffd5dc" opacity="${(0.2 + r() * 0.4).toFixed(2)}"/>`;
  const svg = `<svg viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="warm" cx="0.25" cy="0.62" r="0.6"><stop offset="0" stop-color="#ff4d6d" stop-opacity="0.75"/><stop offset="0.5" stop-color="#5b1022" stop-opacity="0.45"/><stop offset="1" stop-color="#0a0b14" stop-opacity="0"/></radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070a14"/><stop offset="1" stop-color="#1a1020"/></linearGradient>
    <filter id="glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1280" height="720" fill="url(#sky)"/>${stars}
  <path d="M520 330 Q960 40 1400 330 Z" fill="#1b2232" stroke="#334155" stroke-width="6"/>
  <rect width="1280" height="720" fill="url(#warm)"/>
  ${crowd(r, time)}
  ${lena(330, 470, 0.95)}
  </svg>`;
  return `<html><head><style>
  @font-face { font-family: Lilita; src: url(data:font/woff2;base64,${lilita}); }
  body { margin:0; width:1280px; height:720px; position:relative; overflow:hidden; background:#000; }
  svg { position:absolute; inset:0; }
  .txt { position:absolute; left:34px; top:22px; font-family:Lilita; line-height:0.92; paint-order: stroke fill; -webkit-text-stroke: 14px #000; }
  .big { font-size:150px; color:#ffffff; text-shadow: 0 7px 0 #000, 0 0 40px rgba(255,107,129,0.55); letter-spacing:1px; }
  .sub { font-size:60px; color:${ROSE}; margin-top:4px; -webkit-text-stroke: 10px #000; text-shadow: 0 5px 0 #000; }
  .tag { position:absolute; right:60px; top:40px; font-family:Lilita; font-size:38px; color:#fff; background:${RED}; padding:4px 16px 6px; border:4px solid #000; transform:rotate(4deg); }
  </style></head><body>${svg}
  <div class="txt"><div class="big">${big}</div><div class="sub">${sub}</div></div>
  ${tag ? `<div class="tag">${tag}</div>` : ""}
  </body></html>`;
}

const variants = [
  { file: "out/thumbnail.png", big: "9:47 PM", sub: "ALL OF THEM.", tag: "40,000 PEOPLE", time: "9:47 PM" },
  { file: "out/thumbnail-alt.png", big: "DON'T LOOK.", sub: "AT HIS NUMBER.", tag: "40,000 PEOPLE", time: "9:47 PM" },
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
