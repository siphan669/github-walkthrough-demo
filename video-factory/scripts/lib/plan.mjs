// Turns a validated script + available audio into a frame-exact VideoPlan
// (see src/types.ts) for the Remotion composition.
import fs from "node:fs";
import path from "node:path";
import { fullVoicePath, generatedVoicePath, recordedVoicePath } from "./audio.mjs";
import { log, probeDuration } from "./util.mjs";

export const FORMATS = {
  landscape: { width: 1920, height: 1080, label: "16:9" },
  vertical: { width: 1080, height: 1920, label: "9:16" },
  short: { width: 1080, height: 1920, label: "9:16 Short" },
};

const TRANSITION_FRAMES = 15;
const FIRST_LEAD = 20; // frames of picture before the first words
const TAIL = 14; // breathing room after each scene's narration
const MIN_NARRATION_SEC = 3;

// "The *ship* was empty." -> [{text:"The"}, {text:"ship", highlight:true}, ...]
export const tokenize = (narration) => {
  const words = [];
  let inHighlight = false;
  for (const raw of narration.split(/\s+/).filter(Boolean)) {
    const opens = raw.startsWith("*");
    const closes = raw.replace(/[.,!?;:"')\]]+$/, "").endsWith("*");
    if (opens) inHighlight = true;
    const text = raw.replace(/\*/g, "");
    if (text) words.push({ text, highlight: inHighlight });
    if (closes) inHighlight = false;
  }
  return words;
};

// Spoken-length weight for a word: longer words and punctuation take longer.
const weight = (w) => {
  let x = Math.max(2, w.length * 0.9 + 1.5);
  if (/[,;:]$/.test(w)) x += 3;
  if (/[.!?]$/.test(w)) x += 6;
  if (/\d/.test(w)) x += w.replace(/\D/g, "").length * 1.5; // numbers are read out long
  return x;
};

const chunkWords = (words, maxWords) => {
  let chunk = 0;
  let count = 0;
  return words.map((w, i) => {
    const res = { ...w, chunk };
    count++;
    const prev = w.text;
    const sentenceEnd = /[.!?]["')]?$/.test(prev);
    const pause = /[,;:]$/.test(prev);
    const next = words[i + 1];
    if (sentenceEnd || count >= maxWords || (pause && count >= 2) || (next && count >= maxWords - 1 && next.text.length > 9)) {
      chunk++;
      count = 0;
    }
    return res;
  });
};

export const buildPlan = ({ script, dir, format, sceneFilter }) => {
  const fmt = FORMATS[format];
  const fps = script.fps;
  let scenes = script.scenes.map((s, i) => ({ ...s, index: i }));
  if (format === "short") {
    const marked = scenes.filter((s) => s.short);
    if (marked.length) scenes = marked;
    else {
      log.warn('No scenes have "short": true — using roughly the first minute of scenes for the Short.');
      let words = 0;
      scenes = scenes.filter((s) => (words += tokenize(s.narration ?? "").length) <= 150 || s.index === 0);
    }
  }
  if (sceneFilter) scenes = scenes.filter((s) => sceneFilter(s.index));

  const wordsPerSec = script.wordsPerMinute / 60;
  const full = fullVoicePath(dir);
  const allWords = scenes.map((s) => tokenize(s.narration ?? ""));
  const estimate = (words) =>
    words.length ? words.reduce((a, w) => a + weight(w.text), 0) / (wordsPerSec * 7.2) : 0;

  // 1) narration length per scene, in seconds
  let audio = scenes.map(() => null);
  let narrationSec;
  if (full) {
    const total = probeDuration(full);
    const est = allWords.map(estimate);
    const sum = est.reduce((a, b) => a + b, 0) || 1;
    narrationSec = est.map((e) => (e / sum) * total);
  } else {
    narrationSec = scenes.map((s, k) => {
      const rec = recordedVoicePath(dir, s.index);
      const gen = generatedVoicePath(dir, s.index);
      const file = rec ?? (fs.existsSync(gen) && allWords[k].length ? gen : null);
      if (file) {
        audio[k] = path.relative(dir, file).split(path.sep).join("/");
        return probeDuration(file);
      }
      return estimate(allWords[k]);
    });
  }

  // 2) frame layout. With one long voiceover the scenes must butt together
  //    exactly, so there is no tail gap.
  const tail = full ? 0 : TAIL;
  let cursor = 0;
  const planned = scenes.map((s, k) => {
    const lead = k === 0 ? FIRST_LEAD : TRANSITION_FRAMES;
    const narrationFrames = Math.ceil(Math.max(full ? 0.1 : MIN_NARRATION_SEC, narrationSec[k]) * fps);
    const extra = s.type === "outro" ? fps * 3 : s.type === "title" && k === 0 ? fps : 0;
    const durationInFrames = lead + narrationFrames + tail + extra;
    const from = cursor;
    cursor += durationInFrames - TRANSITION_FRAMES;
    return { ...s, from, durationInFrames, narrationStart: lead, narrationFrames, audioSrc: audio[k] };
  });
  const durationInFrames = cursor + TRANSITION_FRAMES;

  // 3) caption words with frame timings
  const maxWords = fmt.width > fmt.height ? 6 : 3;
  let chunkBase = 0;
  const captions = [];
  planned.forEach((s, k) => {
    const words = allWords[k];
    if (!words.length) return;
    const start = s.from + s.narrationStart;
    // Speech engines leave a little silence at both ends of a clip.
    const speechFrames = s.narrationFrames * (s.audioSrc ? 0.94 : 1);
    const lead = s.audioSrc ? Math.round(s.narrationFrames * 0.03) : 0;
    const total = words.reduce((a, w) => a + weight(w.text), 0);
    let t = start + lead;
    const chunked = chunkWords(words, maxWords);
    for (const w of chunked) {
      const len = (weight(w.text) / total) * speechFrames;
      captions.push({ text: w.text, highlight: w.highlight, start: Math.round(t), end: Math.round(t + len), chunk: chunkBase + w.chunk });
      t += len;
    }
    chunkBase += chunked[chunked.length - 1].chunk + 1;
  });

  const speechIntervals = planned
    .filter((s) => (s.narration ?? "").trim())
    .map((s) => [s.from + s.narrationStart, s.from + s.narrationStart + s.narrationFrames]);

  const rel = (p) => (p ? path.relative(dir, p).split(path.sep).join("/") : null);
  return {
    title: script.title,
    channel: script.channel,
    theme: script.theme,
    width: fmt.width,
    height: fmt.height,
    fps,
    durationInFrames,
    transitionFrames: TRANSITION_FRAMES,
    scenes: planned,
    captions,
    captionsEnabled: script.captions !== false,
    music: script._musicFile
      ? { src: rel(script._musicFile), volume: script.music.volume, duckedVolume: script.music.duckedVolume }
      : null,
    voiceoverFull: full ? { src: rel(full), start: planned[0].narrationStart } : null,
    whoosh: script._whooshFile ? { src: rel(script._whooshFile), volume: 0.35 } : null,
    speechIntervals,
  };
};

// YouTube chapter list ("0:00 Intro") built from scene headlines.
export const chaptersFor = (plan) => {
  const lines = [];
  let last = -999;
  for (const s of plan.scenes) {
    const name = s.chapter ?? (s.type === "title" ? "Intro" : null);
    if (!name) continue;
    const sec = s.from / plan.fps;
    if (sec - last < 10 && lines.length) continue; // YouTube needs >= 10 s per chapter
    lines.push({ sec: lines.length === 0 ? 0 : sec, name });
    last = sec;
  }
  return lines;
};
