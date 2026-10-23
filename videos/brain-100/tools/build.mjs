// Generate src/Video.tsx from story/script.mjs + measured voice durations.
// Every shot, voice line (with its captions), music segment and sound effect is written as
// its own JSX node with inline timing, so each one is independently editable in Studio.
// Also writes story/timeline.json (for tools/audio.py) and story/script.md.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { CHAPTERS } from "../story/script.mjs";

const FPS = 30;
const CARD = 2.6;
const lines = JSON.parse(readFileSync("story/lines.json", "utf8"));
const CAMS = ["push", "panL", "pull", "panR", "push", "still"];
const lit = (v) => JSON.stringify(v);
const sec = (s) => `Math.round(${(+s).toFixed(3)} * fps)`;
const label = (s) => s.replace(/"/g, "'").slice(0, 60);

// WAV length from the header; first build runs before tools/audio.py has made the files.
function wavDur(path) {
  if (!existsSync(path)) return 3;
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

// Captions: 2–4 word chunks timed by character count across the line's audio.
function chunks(text) {
  const words = text.replace(/\.\.\./g, "… ").split(/\s+/).filter(Boolean);
  const out = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 4 || (cur.length >= 2 && cur.join(" ").length > 16) || /[.,?!…:]$/.test(w)) { out.push(cur.join(" ")); cur = []; }
  }
  if (cur.length) out.push(cur.join(" "));
  return out;
}
function captionsFor(text, dur) {
  const parts = chunks(text);
  const total = parts.reduce((a, p) => a + p.length + 2, 0);
  let t = 0;
  return parts.map((p) => {
    const d = (dur * 1000 * (p.length + 2)) / total;
    const c = { text: p, startMs: Math.round(t), endMs: Math.round(t + d), timestampMs: null, confidence: null };
    t += d;
    return c;
  });
}

// ---------- timing ----------
let g = 0;
const shots = [], voice = [], music = [], sfx = [];
CHAPTERS.forEach((ch, ci) => {
  const start = g;
  if (ch.title) {
    shots.push({ name: `Chapter ${ci} · ${ch.title}`, from: g, dur: CARD, v: { k: "chapter", n: ci, title: ch.title } });
    sfx.push({ t: g + 0.05, name: "whoosh" });
    g += CARD;
  }
  ch.lines.forEach(([spk, text, v], li) => {
    const id = `${ch.id}-${String(li).padStart(2, "0")}`;
    let d;
    if (spk) {
      const L = lines[id];
      if (!L) throw new Error(`missing voice for ${id}; run tools/tts.mjs`);
      const next = ch.lines[li + 1];
      d = L.dur + 0.3 + (next && next[0] !== spk ? 0.25 : 0) + (text.length > 40 ? 0.1 : 0);
      voice.push({ id, spk, text, file: L.file, from: g, dur: L.dur });
    } else d = v.dur;
    if (v) shots.push({ name: `${id} · ${v.k}${v.bg ? " " + v.bg : ""}`, from: g, dur: d, v });
    else shots[shots.length - 1].dur += d;
    g += d;
  });
  shots[shots.length - 1].dur += 0.4;
  g += 0.4;
  music.push({ id: ch.id, mood: ch.music, from: start, dur: g - start });
});
const TOTAL = g;

shots.forEach((s, i) => {
  s.cam = CAMS[i % CAMS.length];
  const v = s.v, k = v.k;
  if (k === "brain" || (k === "scene" && v.neurons)) sfx.push({ t: s.from + 0.3, name: "hum" });
  if (k === "titlecard") sfx.push({ t: s.from + 0.6, name: "boom" });
  if (k === "scene" && (v.impact || v.lightning)) sfx.push({ t: s.from + (v.lightning ? 0.4 : 0), name: "zap" }, { t: s.from + 0.2, name: "rumble" });
  if (k === "scene" && v.siren) sfx.push({ t: s.from, name: "siren" });
  if (k === "hours" || k === "clock" || k === "text") sfx.push({ t: s.from + 0.15, name: "blip" });
  if (k === "keypad") sfx.push({ t: s.from + 0.4, name: "ticks" });
  if (k === "damper" && v.on) sfx.push({ t: s.from + 0.3, name: "hum" });
  if (k === "thermo") sfx.push({ t: s.from, name: "heartbeat" });
  if (k === "book" || k === "language" || k === "tiles") sfx.push({ t: s.from + 0.2, name: "whoosh" });
  if (v.label) sfx.push({ t: s.from + 0.3, name: "blip" });
});

// two SFX lanes so overlapping sounds never share a Track
const lanes = [[], []], laneEnd = [0, 0];
sfx.sort((a, b) => a.t - b.t).forEach((s) => {
  s.dur = wavDur(`public/sfx/${s.name}.wav`);
  const lane = laneEnd[0] <= s.t ? 0 : laneEnd[1] <= s.t ? 1 : -1;
  if (lane < 0) return; // a third overlapping effect would just be noise
  laneEnd[lane] = s.t + s.dur;
  lanes[lane].push(s);
});

// ---------- code generation ----------
const shotJsx = shots.map((s, i) => `        <Shot name="${label(s.name)}" from={${sec(s.from)}} durationInFrames={${sec(s.dur)}} seconds={${s.dur.toFixed(3)}} seed={${i + 7}} cam="${s.cam}" v={${lit(s.v)}} />`).join("\n");
const voiceJsx = voice.map((l) => `        <Sequence name="${l.spk} · ${label(l.text)}" from={${sec(l.from)}} durationInFrames={${sec(l.dur + 0.05)}} layout="none">
          <Audio name="Voice ${l.id}" src={staticFile("${l.file}")} />
          <Captions name="Captions ${l.id}" captions={${lit(captionsFor(l.text, l.dur))}} />
        </Sequence>`).join("\n");
const musicJsx = music.map((m) => `        <Audio name="Music ${m.id} · ${m.mood}" from={${sec(m.from)}} durationInFrames={${sec(m.dur)}} src={staticFile("music/${m.id}.wav")} volume={0.55} />`).join("\n");
const sfxJsx = (lane) => lane.map((s) => `        <Audio name="SFX ${s.name}" from={${sec(s.t)}} durationInFrames={${sec(s.dur)}} src={staticFile("sfx/${s.name}.wav")} volume={0.7} />`).join("\n");

writeFileSync("src/Video.tsx", `// Generated by tools/build.mjs from story/script.mjs — edit the script and rebuild, or
// edit items here / in Studio directly (each item is its own node with inline timing).
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, Track, useVideoConfig } from "remotion";
import { Captions } from "./Captions";
import { Shot } from "./Shot";
import { T } from "./theme";

export const DURATION_SECONDS = ${TOTAL.toFixed(3)};

export const Video: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: T.bg0 }}>
      <style>{".mono{font-family:'Space Mono',monospace}.display{font-family:'League Gothic',sans-serif}.kid{font-family:'Space Mono',monospace;font-weight:700}"}</style>
      <Track name="Shots">
${shotJsx}
      </Track>
      <Track name="Voice and captions">
${voiceJsx}
      </Track>
      <Track name="Music">
${musicJsx}
      </Track>
      <Track name="SFX A">
${sfxJsx(lanes[0])}
      </Track>
      <Track name="SFX B">
${sfxJsx(lanes[1])}
      </Track>
    </AbsoluteFill>
  );
};
`);

writeFileSync("story/shots.json", JSON.stringify(shots.map(({ name, from, dur, v }) => ({ name, start: +from.toFixed(3), dur: +dur.toFixed(3), visual: v })), null, 1));
writeFileSync("story/timeline.json", JSON.stringify({ total: TOTAL, chapters: music.map((m) => ({ id: m.id, music: m.mood, start: m.from, dur: m.dur })) }, null, 1));
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
let md = `# What If Your Brain Suddenly Used 100% of Its Potential? — script\n\nRuntime ${fmt(TOTAL)} · ${voice.length} voice lines · ${shots.length} shots\n\n`;
CHAPTERS.forEach((ch, i) => {
  md += `## ${fmt(music[i].from)} ${ch.title || "Cold open"}\n\n| # | Speaker | Line | Visual |\n| --- | --- | --- | --- |\n`;
  ch.lines.forEach(([spk, text, v], li) => { md += `| ${li} | ${spk || "—"} | ${text || "*(title card)*"} | ${v ? v.k + (v.bg ? ":" + v.bg : "") : "↳ same shot"} |\n`; });
  md += "\n";
});
writeFileSync("story/script.md", md);
console.log(`total=${fmt(TOTAL)} (${TOTAL.toFixed(1)}s) shots=${shots.length} voice=${voice.length} sfx=${lanes[0].length + lanes[1].length}`);
console.log("chapters:", music.map((m) => `${m.id}@${fmt(m.from)}`).join(" "));
