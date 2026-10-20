// Ifverse-style thumbnails (1280x720): black round-head character with a smug glint,
// glowing x-ray eye beaming at the cracked tower, chunky outlined text top-left.
// Bottom-right stays clear for YouTube's duration badge.
import { readFileSync } from "node:fs";
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { rng } from "./art.mjs";

const lilita = readFileSync("assets/fonts/lilita-one-latin-400-normal.woff2").toString("base64");

function skyline(r) {
  let s = "", x = -10;
  while (x < 1290) {
    const w = 50 + r() * 80, h = 80 + r() * 200;
    s += `<rect x="${x | 0}" y="${(720 - h) | 0}" width="${w | 0}" height="${h | 0}" fill="#0a1226"/>`;
    for (let wy = 720 - h + 12; wy < 712; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 16)
      if (r() < 0.3) s += `<rect x="${wx | 0}" y="${wy | 0}" width="6" height="9" fill="#ffb547" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`;
    x += w + 4;
  }
  return s;
}

function tower() {
  const x0 = 870, x1 = 1070, top = 70, base = 720, floors = 34, fh = (base - top) / floors;
  let s = `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${base - top}" fill="#06243a" stroke="#5fe3ff" stroke-width="5"/>`;
  for (let f = 1; f < floors; f++) s += `<line x1="${x0}" x2="${x1}" y1="${top + f * fh}" y2="${top + f * fh}" stroke="#5fe3ff" stroke-opacity="0.35" stroke-width="2"/>`;
  for (const cx of [x0 + 30, (x0 + x1) / 2, x1 - 30]) s += `<line x1="${cx}" x2="${cx}" y1="${top}" y2="${base}" stroke="#5fe3ff" stroke-width="5" stroke-opacity="0.85"/>`;
  s += `<line x1="${(x0 + x1) / 2}" x2="${(x0 + x1) / 2}" y1="${top - 50}" y2="${top}" stroke="#5fe3ff" stroke-width="5"/><circle cx="${(x0 + x1) / 2}" cy="${top - 52}" r="7" fill="#ff3b3b"/>`;
  // Nora: tiny lit window and figure near the top
  s += `<rect x="${x0 + 40}" y="${top + 2 * fh}" width="${x1 - x0 - 80}" height="${fh}" fill="#ffcf4a" opacity="0.85"/><circle cx="${x0 + 100}" cy="${top + 2 * fh + 6}" r="4" fill="#1a1a1a"/><line x1="${x0 + 100}" x2="${x0 + 100}" y1="${top + 2 * fh + 10}" y2="${top + 3 * fh - 2}" stroke="#1a1a1a" stroke-width="3"/>`;
  // the crack
  const cy = top + 19 * fh;
  s += `<rect x="${x0 - 12}" y="${cy - 26}" width="${x1 - x0 + 24}" height="52" fill="#ff3b3b" fill-opacity="0.18" stroke="#ff3b3b" stroke-width="5"/>`;
  s += `<path d="M${x0 + 20} ${cy} l25 -14 l18 18 l22 -20 l20 16 l24 -12 l18 14 l26 -16 l18 12 l12 -6" stroke="#ff3b3b" stroke-width="8" fill="none" stroke-linejoin="round"/>`;
  s += `<path d="M${x0 + 20} ${cy} l25 -14 l18 18 l22 -20 l20 16 l24 -12 l18 14 l26 -16 l18 12 l12 -6" stroke="#ff3b3b" stroke-width="26" stroke-opacity="0.3" fill="none"/>`;
  return { svg: s, crackY: cy, x0 };
}

function character() {
  // hood + shoulders, then head, then smug face looking right
  return `
  <path d="M60 720 Q80 560 230 540 L440 540 Q590 560 610 720 Z" fill="#1d6fe0"/>
  <circle cx="335" cy="425" r="222" fill="#1d6fe0"/>
  <circle cx="335" cy="425" r="222" fill="none" stroke="#4f9bff" stroke-width="10"/>
  <circle cx="345" cy="440" r="190" fill="#0b0b0d"/>
  <path d="M190 360 a190 190 0 0 1 150 -110" stroke="#ffffff" stroke-opacity="0.12" stroke-width="16" fill="none" stroke-linecap="round"/>
  <g transform="translate(370 440) scale(1.4) translate(-370 -440)">
  <!-- left eye: narrow smug squint -->
  <path d="M262 418 Q300 400 342 410 Q302 430 262 418 Z" fill="#ffffff"/>
  <circle cx="320" cy="414" r="8" fill="#0b0b0d"/>
  <!-- right eye: glowing x-ray -->
  <path d="M392 408 Q440 386 486 400 Q442 428 392 408 Z" fill="#ffffff"/>
  <circle cx="452" cy="404" r="12" fill="#5fe3ff"/>
  <!-- smirk -->
  <path d="M340 520 Q400 540 452 500" stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M447 494 l14 6" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
  </g>`;
}

function sparkle(x, y, r) {
  return `<g filter="url(#glow)"><path d="M${x} ${y - r} Q${x + 5} ${y - 5} ${x + r} ${y} Q${x + 5} ${y + 5} ${x} ${y + r} Q${x - 5} ${y + 5} ${x - r} ${y} Q${x - 5} ${y - 5} ${x} ${y - r} Z" fill="#ffffff"/></g>`;
}

function page({ big, bigColor, sub, tag }) {
  const r = rng(11);
  const t = tower();
  const eyeX = 485, eyeY = 390; // right eye after the 1.4x face scale
  let stars = "";
  for (let i = 0; i < 60; i++) stars += `<circle cx="${(r() * 1280) | 0}" cy="${(r() * 420) | 0}" r="${(r() * 1.6 + 0.4).toFixed(1)}" fill="#cfe3ff" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`;
  const svg = `<svg viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="warm" cx="0.27" cy="0.6" r="0.55"><stop offset="0" stop-color="#ff9a3c" stop-opacity="0.95"/><stop offset="0.45" stop-color="#b8461f" stop-opacity="0.45"/><stop offset="1" stop-color="#0b1630" stop-opacity="0"/></radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070d1f"/><stop offset="1" stop-color="#142446"/></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5fe3ff" stop-opacity="0.75"/><stop offset="1" stop-color="#5fe3ff" stop-opacity="0.08"/></linearGradient>
    <filter id="glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1280" height="720" fill="url(#sky)"/>${stars}
  <rect width="1280" height="720" fill="url(#warm)"/>
  ${skyline(r)}
  <rect x="820" y="0" width="300" height="720" fill="#5fe3ff" opacity="0.06"/>
  ${t.svg}
  <polygon points="${eyeX},${eyeY - 6} ${t.x0 + 40},${t.crackY - 120} ${t.x0 + 40},${t.crackY + 110} ${eyeX},${eyeY + 6}" fill="url(#beam)"/>
  ${character()}
  <circle cx="${eyeX}" cy="${eyeY}" r="30" fill="#5fe3ff" opacity="0.5" filter="url(#glow)"/>
  ${sparkle(eyeX + 4, eyeY - 4, 30)}
  ${sparkle(280, 398, 16)}
  </svg>`;
  return `<html><head><style>
  @font-face { font-family: Lilita; src: url(data:font/woff2;base64,${lilita}); }
  body { margin:0; width:1280px; height:720px; position:relative; overflow:hidden; background:#000; }
  svg { position:absolute; inset:0; }
  .txt { position:absolute; left:34px; top:22px; font-family:Lilita; line-height:0.92; paint-order: stroke fill; -webkit-text-stroke: 14px #000; }
  .big { font-size:150px; color:${bigColor}; text-shadow: 0 7px 0 #000; letter-spacing:1px; }
  .sub { font-size:60px; color:#ff3b3b; margin-top:4px; -webkit-text-stroke: 10px #000; text-shadow: 0 5px 0 #000; }
  .tag { position:absolute; left:${t.x0 - 215}px; top:${t.crackY - 26}px; font-family:Lilita; font-size:34px; color:#fff; background:#ff3b3b; padding:4px 14px 6px; border:4px solid #000; transform:rotate(-4deg); }
  </style></head><body>${svg}
  <div class="txt"><div class="big">${big}</div><div class="sub">${sub}</div></div>
  ${tag ? `<div class="tag">${tag}</div>` : ""}
  </body></html>`;
}

const variants = [
  { file: "out/thumbnail.png", big: "X-RAY", bigColor: "#ffd400", sub: "I SAW IT.", tag: "FLOOR 31" },
  { file: "out/thumbnail-alt.png", big: "CRACKED.", bigColor: "#ffffff", sub: "3,000 INSIDE.", tag: "FLOOR 31" },
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
