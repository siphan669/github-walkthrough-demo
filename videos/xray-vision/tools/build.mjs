// Build the HyperFrames project from story/script.mjs + measured voice durations:
// compositions/<chapter>.html (shots + timeline), index.html (chapters, voice, music, sfx,
// captions), story/script.md, story/shots.json and story/timeline.json (for audio synthesis).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { CHAPTERS } from "../story/script.mjs";
import { C, scene, tower, eye, obj } from "./art.mjs";

const lines = JSON.parse(readFileSync("assets/audio/lines.json", "utf8"));
const runtime = readFileSync("tools/runtime.js", "utf8");
const CARD = 2.6;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const CSS = `
#root { position:absolute; inset:0; background:${C.bg0}; overflow:hidden; font-family:"League Gothic", sans-serif; }
#root .shot { position:absolute; inset:0; overflow:hidden; background:${C.bg0}; }
#root .cam { position:absolute; inset:0; }
#root .layer { position:absolute; inset:0; }
#root .art { position:absolute; inset:0; width:100%; height:100%; display:block; }
#root .xray .xbg { filter: grayscale(1) invert(1) sepia(1) hue-rotate(150deg) saturate(4) brightness(0.45); }
#root .xray { background:#03121c; }
#root .flashback { filter: sepia(0.7) brightness(0.85); }
#root .vignette { position:absolute; inset:0; background: radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(20,10,0,0.75) 100%); }
#root .scan { position:absolute; top:0; left:0; width:90px; height:100%; background: linear-gradient(90deg, rgba(95,227,255,0), rgba(95,227,255,0.55), rgba(95,227,255,0)); }
#root .siren { position:absolute; inset:0; background: linear-gradient(90deg, rgba(255,60,60,0.22), rgba(60,110,255,0.22)); }
#root .mono, #root .tag, #root .callout, #root .sub { font-family:"Space Mono", monospace; }
#root .display { font-family:"League Gothic", sans-serif; }
#root .kid { font-family:"Space Mono", monospace; font-weight:700; }
#root .tag { position:absolute; top:64px; left:80px; padding:12px 22px; border:3px solid ${C.xray}; color:${C.xray}; font-size:34px; letter-spacing:0.08em; background:rgba(4,9,16,0.7); }
#root .callout { position:absolute; padding:10px 18px; border:3px solid; font-size:34px; letter-spacing:0.06em; background:rgba(4,9,16,0.75); }
#root .center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:18px; }
#root .big { font-size:230px; line-height:0.9; color:${C.ink}; letter-spacing:0.02em; }
#root .big.bad { color:${C.danger}; }
#root .sub { font-size:44px; color:${C.xray}; letter-spacing:0.14em; }
#root .clock { font-family:"Space Mono", monospace; font-size:220px; color:${C.ink}; letter-spacing:0.04em; }
#root .clock.alarm { color:${C.danger}; }
#root .kicker { font-family:"Space Mono", monospace; font-size:40px; color:${C.dim}; letter-spacing:0.3em; }
#root .hero { font-size:300px; line-height:0.9; color:${C.xray}; text-shadow:0 0 60px rgba(95,227,255,0.6); }
#root .chapnum { font-family:"Space Mono", monospace; font-size:36px; color:${C.xray}; letter-spacing:0.4em; }
#root .chaptitle { font-size:170px; color:${C.ink}; }
#root .rule { width:520px; height:4px; background:${C.xray}; }
#root .rows { position:absolute; left:220px; right:220px; top:150px; display:flex; flex-direction:column; gap:50px; }
#root .row .lbl { font-family:"Space Mono", monospace; font-size:40px; color:${C.dim}; letter-spacing:0.1em; }
#root .row .track { position:relative; height:70px; margin-top:16px; border:3px solid #24344f; }
#root .row .fill { position:absolute; left:0; top:0; bottom:0; width:0%; }
#root .row .val { font-size:120px; color:${C.ink}; margin-top:8px; }
#root .whiteflash { position:absolute; inset:0; background:#fff; }
#root .cta { display:flex; gap:40px; margin-top:30px; }
#root .btn { font-family:"Space Mono", monospace; font-size:40px; padding:18px 40px; border:4px solid ${C.ink}; color:${C.ink}; }
#root .btn.red { background:${C.danger}; border-color:${C.danger}; }
`;

const CAMS = ["push", "panL", "pull", "panR", "push", "still"];
function render(v, seed, shotIndex) {
  switch (v.k) {
    case "scene": return scene(v, seed);
    case "tower": return tower(v, seed);
    case "eye": return eye(v);
    case "obj": return obj(v, seed);
    case "text":
      return `<div class="center"><div class="big${v.bad ? " bad" : ""}" data-glitch="0.15">${esc(v.big)}</div>${v.sub ? `<div class="sub" data-in="up" data-delay="0.6">${esc(v.sub)}</div>` : ""}${v.cta ? `<div class="cta" data-in="up" data-delay="1.4"><div class="btn">👍 LIKE</div><div class="btn red">SUBSCRIBE</div></div>` : ""}</div>`;
    case "clock":
      return `<div class="center"><div class="kicker" data-in="fade">TIME</div><div class="clock${v.alarm ? " alarm" : ""}" data-glitch="0.1"${v.alarm ? ' data-pulse="0.5"' : ""}>${v.time}</div></div>`;
    case "count":
      return `<div class="rows">${v.rows.map(([lbl, val, unit, tone], i) => `<div class="row"><div class="lbl">${lbl}</div><div class="track"><div class="fill" style="background:${tone === "bad" ? C.danger : C.ok}" data-bar="${val / 11},${0.3 + i * 1.4}"></div></div><div class="val"><span data-count="${val},${0.3 + i * 1.4}">0</span> ${unit}</div></div>`).join("")}</div>`;
    case "flash":
      return `<div class="layer" style="background:${C.bg0}"></div><div class="whiteflash" data-flash="1"></div>`;
    case "titlecard":
      return `<div class="center"><div class="kicker" data-in="fade" data-delay="0.2">${esc(v.big)}</div><div class="hero display" data-glitch="0.6">${esc(v.hero)}</div></div><div class="scan" data-scan="1"></div>`;
    case "chapter":
      return `<div class="center"><div class="chapnum" data-in="fade">CHAPTER ${v.n}</div><div class="rule" data-in="right" data-delay="0.15"></div><div class="chaptitle display" data-in="up" data-delay="0.3">${esc(v.title)}</div></div>`;
  }
  throw new Error("unknown visual " + v.k);
}
function needsCam(k) { return !["chapter", "titlecard", "flash", "count"].includes(k); }

// ---------- timing ----------
let globalT = 0;
const chapters = [], allShots = [], voice = [], captions = [], sfx = [];
CHAPTERS.forEach((ch, ci) => {
  let t = 0;
  const shots = [];
  if (ch.title) {
    shots.push({ v: { k: "chapter", n: ci, title: ch.title }, s: 0, d: CARD });
    sfx.push({ t: globalT + 0.05, name: "whoosh" });
    t = CARD;
  }
  ch.lines.forEach(([spk, text, v], li) => {
    const id = `${ch.id}-${String(li).padStart(2, "0")}`;
    let d;
    if (spk) {
      const L = lines[id];
      if (!L) throw new Error(`missing voice for ${id}; run tools/tts.mjs`);
      const next = ch.lines[li + 1];
      const gap = 0.3 + (next && next[0] !== spk ? 0.25 : 0) + (/\.\.\.$|[.?!]$/.test(text) && text.length > 40 ? 0.1 : 0);
      d = L.dur + gap;
      voice.push({ id, file: L.file, t: globalT + t, dur: L.dur, spk });
      captions.push({ text, t: globalT + t, dur: L.dur });
    } else d = v.dur;
    if (v || !shots.length) shots.push({ v, s: t, d, line: id });
    else shots[shots.length - 1].d += d;
    t += d;
  });
  if (!ch.lines.at(-1)[0]) {} // title card holds its own duration
  const dur = +(t + 0.4).toFixed(3);
  shots.at(-1).d += 0.4;
  shots.forEach((sh, i) => {
    const k = sh.v.k;
    const g = globalT + sh.s;
    if (k === "eye" && (sh.v.state === "off" || sh.v.state === "glow")) sfx.push({ t: g + 0.3, name: "whoosh" });
    if ((k === "scene" && sh.v.xray) || (k === "tower" && sh.v.xray)) sfx.push({ t: g + 0.4, name: "hum" });
    if (k === "obj" && sh.v.ring) sfx.push({ t: g, name: "ring" });
    if (k === "obj" && sh.v.o === "safe" && sh.v.open) sfx.push({ t: g + 0.1, name: "click" });
    if (k === "obj" && sh.v.o === "dial") sfx.push({ t: g + 0.3, name: "ticks" });
    if (k === "obj" && sh.v.o === "heart") sfx.push({ t: g, name: "heartbeat" });
    if (k === "obj" && sh.v.label) sfx.push({ t: g + 0.3, name: "blip" });
    if (k === "titlecard") sfx.push({ t: g + 0.55, name: "boom" });
    if (k === "flash") sfx.push({ t: g, name: "zap" });
    if (k === "tower" && sh.v.fail) sfx.push({ t: g + 0.2, name: "rumble" });
    if (k === "clock") sfx.push({ t: g + 0.1, name: "tick" });
    if (k === "text") sfx.push({ t: g + 0.15, name: "blip" });
    if (k === "scene" && sh.v.siren) sfx.push({ t: g, name: "siren" });
    allShots.push({ chapter: ch.id, id: `${ch.id}-s${String(i).padStart(2, "0")}`, start: +g.toFixed(3), dur: +sh.d.toFixed(3), visual: sh.v });
  });
  chapters.push({ id: ch.id, title: ch.title, music: ch.music, start: +globalT.toFixed(3), dur, shots });
  globalT += dur;
});
const TOTAL = +globalT.toFixed(3);

// ---------- chapter files ----------
mkdirSync("compositions", { recursive: true });
chapters.forEach((ch, ci) => {
  const body = ch.shots.map((sh, i) => {
    const seed = ci * 100 + i + 7;
    const inner = render(sh.v, seed, i);
    const cam = needsCam(sh.v.k) ? CAMS[(ci + i) % CAMS.length] : null;
    return `<div class="shot clip" id="${ch.id}-s${i}" data-start="${sh.s.toFixed(3)}" data-duration="${sh.d.toFixed(3)}" data-track-index="0" data-s="${sh.s.toFixed(3)}" data-d="${sh.d.toFixed(3)}">` +
      (cam ? `<div class="cam" data-cam="${cam}">${inner}</div>` : inner) + `</div>`;
  }).join("\n");
  const rt = runtime.replace('document.currentScript ? document.currentScript.dataset.id : "__ID__"', JSON.stringify(ch.id));
  writeFileSync(`compositions/${ch.id}.html`, `<!doctype html>
<html><head><meta charset="UTF-8" /></head><body><template>
<style>${CSS}</style>
<div id="root" data-composition-id="${ch.id}" data-width="1920" data-height="1080" data-duration="${ch.dur}">
${body}
</div>
<script>${rt}</script>
</template></body></html>
`);
});

// ---------- captions: 2–4 word chunks timed by character count ----------
function chunks(text) {
  const words = text.replace(/\.\.\./g, "… ").split(/\s+/).filter(Boolean);
  const out = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    const len = cur.join(" ").length;
    if (cur.length >= 4 || (cur.length >= 2 && len > 16) || /[.,?!…:]$/.test(w)) { out.push(cur.join(" ")); cur = []; }
  }
  if (cur.length) out.push(cur.join(" "));
  return out;
}
const capEls = [];
let ci = 0;
for (const c of captions) {
  const parts = chunks(c.text);
  const total = parts.reduce((a, p) => a + p.length + 2, 0);
  let t = c.t;
  for (const p of parts) {
    const d = (c.dur * (p.length + 2)) / total;
    const words = p.split(" ");
    let key = words.findIndex((w) => /\d/.test(w));
    if (key < 0) key = words.reduce((bi, w, i, a) => (w.replace(/\W/g, "").length > a[bi].replace(/\W/g, "").length ? i : bi), 0);
    const html = words.map((w, i) => (i === key ? `<b>${esc(w)}</b>` : esc(w))).join(" ");
    capEls.push(`<div class="cap clip" id="cap${ci}" data-start="${t.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="6"><span>${html}</span></div>`);
    t += d;
    ci++;
  }
}

// ---------- index.html ----------
const hosts = chapters.map((ch, i) => `<div id="${ch.id}" class="clip" data-composition-id="${ch.id}" data-composition-src="compositions/${ch.id}.html" data-start="${ch.start}" data-duration="${ch.dur}" data-track-index="0" data-width="1920" data-height="1080"></div>`).join("\n      ");
const vo = voice.map((v) => `<audio id="vo-${v.id}" src="${v.file}" data-start="${v.t.toFixed(3)}" data-duration="${v.dur.toFixed(3)}" data-track-index="2" data-volume="1"></audio>`).join("\n      ");
const music = chapters.map((ch) => `<audio id="mus-${ch.id}" src="assets/audio/music/${ch.id}.wav" data-start="${ch.start}" data-duration="${ch.dur}" data-track-index="3" data-volume="0.55"></audio>`).join("\n      ");
// WAV length from the header (data chunk bytes / byte rate).
function wavDur(path) {
  const b = readFileSync(path);
  const byteRate = b.readUInt32LE(28);
  let o = 12;
  while (o < b.length - 8) {
    const id = b.toString("ascii", o, o + 4), size = b.readUInt32LE(o + 4);
    if (id === "data") return size / byteRate;
    o += 8 + size + (size % 2);
  }
  throw new Error("no data chunk in " + path);
}
const trackEnd = [0, 0];
const sfxEls = sfx.sort((a, b) => a.t - b.t).map((s, i) => {
  const file = `assets/audio/sfx/${s.name}.wav`;
  const d = wavDur(file);
  const lane = trackEnd[0] <= s.t ? 0 : 1;
  trackEnd[lane] = s.t + d;
  return `<audio id="sfx${i}" src="${file}" data-start="${s.t.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="${4 + lane}" data-volume="0.7"></audio>`;
}).join("\n      ");

writeFileSync("index.html", `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: ${C.bg0}; }
      #root { width: 100%; height: 100%; position: relative; background: ${C.bg0}; }
      .cap { position: absolute; left: 0; right: 0; bottom: 70px; display: flex; justify-content: center; z-index: 20; }
      .cap span { font-family: "League Gothic", sans-serif; font-size: 92px; line-height: 1; text-transform: uppercase; color: #ffffff; letter-spacing: 0.02em; padding: 6px 26px 10px; background: rgba(3,6,12,0.62); border-radius: 10px; }
      .cap b { color: ${C.xray}; font-weight: 400; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1920" data-height="1080">
      ${hosts}
      ${capEls.join("\n      ")}
      ${vo}
      ${music}
      ${sfxEls}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      document.querySelectorAll(".cap span").forEach((el) => {
        const cap = el.parentElement;
        tl.fromTo(el, { scale: 0.86, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.12, ease: "back.out(2)" }, parseFloat(cap.dataset.start));
      });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);

// ---------- docs / data ----------
writeFileSync("story/shots.json", JSON.stringify(allShots, null, 1));
writeFileSync("story/timeline.json", JSON.stringify({ total: TOTAL, chapters: chapters.map(({ shots, ...c }) => c), sfx, voice }, null, 1));
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
let md = `# What If You Had X-Ray Vision? — script\n\nRuntime ${fmt(TOTAL)} · ${voice.length} voice lines · ${allShots.length} shots\n\n`;
CHAPTERS.forEach((ch, i) => {
  md += `## ${fmt(chapters[i].start)} ${ch.title || "Cold open"}\n\n| # | Speaker | Line | Visual |\n| --- | --- | --- | --- |\n`;
  ch.lines.forEach(([spk, text, v], li) => { md += `| ${li} | ${spk || "—"} | ${text || "*(title card)*"} | ${v ? v.k + (v.bg ? `:${v.bg}` : v.o ? `:${v.o}` : v.state ? `:${v.state}` : "") : "↳ same shot"} |\n`; });
  md += "\n";
});
writeFileSync("story/script.md", md);
console.log(`total=${fmt(TOTAL)} (${TOTAL}s) shots=${allShots.length} captions=${capEls.length} sfx=${sfx.length}`);
console.log("chapters:", chapters.map((c) => `${c.id}@${fmt(c.start)}`).join(" "));
