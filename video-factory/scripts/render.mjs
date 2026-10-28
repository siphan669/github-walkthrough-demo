// npm run make -- <video-folder> [options]
//
// Script -> voiceover -> music -> plan -> Remotion render -> FFmpeg finish.
// Everything runs locally and for free.
//
// Options:
//   --format landscape|vertical|short|both|all   (default: landscape)
//   --preview            fast half-resolution test render
//   --scenes 1-5         only render some scenes (e.g. 3 or 2-6 or 1,4,7)
//   --no-voice           skip text-to-speech
//   --no-music           no background music
//   --concurrency 4      browser tabs used for rendering
//   --force-voice        re-generate every voice clip
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { generateMusic, generateVoice, generateWhoosh } from "./lib/audio.mjs";
import { FORMATS, buildPlan, chaptersFor } from "./lib/plan.mjs";
import { loadScript } from "./lib/script.mjs";
import {
  OUT_DIR, ROOT, UserError, c, findBrowser, findFile, formatTime, log, parseArgs,
  requireFfmpeg, run, runMain, videoDir,
} from "./lib/util.mjs";

const parseScenes = (spec) => {
  if (!spec || spec === true) return null;
  const set = new Set();
  for (const part of String(spec).split(",")) {
    const [a, b] = part.split("-").map((n) => parseInt(n, 10));
    if (!Number.isFinite(a)) throw new UserError(`--scenes "${spec}" is not understood.`, "Use e.g. --scenes 3 or --scenes 2-6 or --scenes 1,4,7");
    for (let i = a; i <= (Number.isFinite(b) ? b : a); i++) set.add(i - 1);
  }
  return (i) => set.has(i);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const slug = args._[0];
  const dir = videoDir(slug);
  const formatArg = String(args.format ?? "landscape");
  const formats =
    formatArg === "both" ? ["landscape", "vertical"] : formatArg === "all" ? ["landscape", "vertical", "short"] : [formatArg];
  for (const f of formats) {
    if (!FORMATS[f]) throw new UserError(`Unknown format "${f}".`, "Use --format landscape, vertical, short, both or all.");
  }
  const preview = Boolean(args.preview);
  const started = Date.now();

  log.step("1/5  Checking tools");
  const [major] = process.versions.node.split(".").map(Number);
  if (major < 18) throw new UserError(`Node.js ${process.versions.node} is too old.`, "Install Node.js 18 or newer from https://nodejs.org (free).");
  requireFfmpeg();
  const browser = findBrowser();
  log.ok(`Node ${process.versions.node}, FFmpeg found${browser ? ", local Chromium found" : ", Remotion will download its free headless browser on first run"}`);

  log.step("2/5  Reading the script");
  const { script, source, warnings } = loadScript(dir);
  warnings.forEach((w) => log.warn(w));
  log.ok(`${path.relative(ROOT, source)}: "${script.title}" — ${script.scenes.length} scenes`);

  log.step("3/5  Preparing audio");
  if (args["no-voice"] || args.voice === false) log.info("Voice generation skipped (--no-voice).");
  else generateVoice(script, dir, { force: Boolean(args["force-voice"]) });

  if (!args["no-music"]) {
    const userMusic = script.music.file ? path.resolve(dir, script.music.file) : findFile(path.join(dir, "audio", "music"));
    if (userMusic && fs.existsSync(userMusic)) {
      script._musicFile = userMusic;
      log.ok(`Music: ${path.relative(dir, userMusic)}`);
    } else if (script.music.file) {
      throw new UserError(`Music file not found: ${script.music.file}`, `Put the file at videos/${slug}/${script.music.file} or remove "music.file" from the script.`);
    } else if (script.music.generate !== false) {
      script._musicFile = generateMusic(dir);
      log.ok("Music: original ambient track generated with FFmpeg (copyright-free)");
    }
  }
  if (script.sfx !== false) script._whooshFile = findFile(path.join(dir, "audio", "whoosh")) ?? generateWhoosh(dir);

  log.step("4/5  Bundling the Remotion project");
  let lastPct = -1;
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, "src", "index.ts"),
    publicDir: dir, // audio files are referenced relative to the video folder
    onProgress: (p) => {
      if (p % 25 === 0 && p !== lastPct) log.info(c.dim(`bundling ${p}%`));
      lastPct = p;
    },
  });
  log.ok("Bundle ready");

  log.step("5/5  Rendering");
  const outDir = path.join(OUT_DIR, slug);
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];
  for (const format of formats) {
    const plan = buildPlan({ script, dir, format, sceneFilter: parseScenes(args.scenes) });
    if (!plan.scenes.length) throw new UserError("No scenes selected to render.", "Check the --scenes option.");
    const seconds = plan.durationInFrames / plan.fps;
    log.info(`${c.bold(FORMATS[format].label)}  ${plan.width}x${plan.height}, ${plan.scenes.length} scenes, ${formatTime(seconds)} long`);
    if (format === "landscape" && !args.scenes && (seconds < 360 || seconds > 600)) {
      log.warn(`Length is ${formatTime(seconds)}; the target for this channel style is 6:00–10:00. Add or trim narration.`);
    }
    if (format === "short" && seconds > 180) log.warn("YouTube Shorts must be 3:00 or less — mark fewer scenes with \"short\": true.");

    fs.writeFileSync(path.join(outDir, `plan-${format}.json`), JSON.stringify(plan, null, 2));
    // Also feed the Studio preview (npm run studio).
    fs.writeFileSync(path.join(ROOT, "src", "generated", "plan.json"), JSON.stringify(plan, null, 2));

    const suffix = preview ? `${format}-preview` : format;
    const raw = path.join(outDir, `${slug}-${suffix}.raw.mp4`);
    const final = path.join(outDir, `${slug}-${suffix}.mp4`);
    const inputProps = { plan };
    const browserOpts = browser ? { browserExecutable: browser } : {};
    const composition = await selectComposition({ serveUrl, id: "Video", inputProps, ...browserOpts, logLevel: "error" });

    const t0 = Date.now();
    let lastLogged = -1;
    const seenLogs = new Set();
    try {
      await renderMedia({
        composition,
        serveUrl,
        codec: "h264",
        audioCodec: "aac",
        audioBitrate: "192k",
        outputLocation: raw,
        inputProps,
        ...browserOpts,
        concurrency: Number(args.concurrency) || Math.max(1, Math.min(8, os.cpus().length)),
        scale: preview ? 0.5 : 1,
        crf: preview ? 28 : 18,
        imageFormat: "jpeg",
        jpegQuality: preview ? 70 : 90,
        timeoutInMilliseconds: 120000,
        logLevel: "error",
        // Show each distinct browser error once (they usually point at a bad value in the script).
        onBrowserLog: (l) => {
          if (l.type !== "error" || !l.text.trim() || seenLogs.has(l.text)) return;
          seenLogs.add(l.text);
          log.warn(`Browser: ${l.text.slice(0, 300)}`);
        },
        onProgress: ({ progress, renderedFrames }) => {
          const pct = Math.floor(progress * 100);
          if (pct >= lastLogged + 5) {
            lastLogged = pct;
            const elapsed = (Date.now() - t0) / 1000;
            const eta = progress > 0.02 ? elapsed / progress - elapsed : NaN;
            log.info(c.dim(`  ${String(pct).padStart(3)}%  frame ${renderedFrames}/${composition.durationInFrames}` + (Number.isFinite(eta) ? `  ~${formatTime(eta)} left` : "")));
          }
        },
      });
    } catch (e) {
      throw new UserError(
        `Rendering failed: ${e.message.split("\n")[0]}`,
        "Run with --scenes N to find the scene that breaks, or open `npm run studio -- " + slug + "` to preview it. If the browser failed to start, run `npm run doctor`.",
      );
    }

    // FFmpeg finishing pass: YouTube loudness (-14 LUFS) + fast-start MP4.
    run("ffmpeg", ["-y", "-v", "error", "-i", raw, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", final], {
      label: "FFmpeg finishing pass",
    });
    fs.rmSync(raw, { force: true });

    const thumb = final.replace(/\.mp4$/, "-thumbnail.jpg");
    run("ffmpeg", ["-y", "-v", "error", "-ss", String(Math.min(2.5, seconds / 2)), "-i", final, "-frames:v", "1", "-q:v", "2", thumb], { label: "Thumbnail" });

    const chapters = chaptersFor(plan);
    const desc = [
      script.title,
      "",
      script.description ?? "",
      "",
      chapters.length >= 3 ? "Chapters:\n" + chapters.map((ch) => `${formatTime(ch.sec)} ${ch.name}`).join("\n") : "",
      "",
      script.sources?.length ? "Sources:\n" + script.sources.map((s) => `- ${s}`).join("\n") : "",
    ].join("\n").replace(/\n{3,}/g, "\n\n").trim();
    fs.writeFileSync(final.replace(/\.mp4$/, "-description.txt"), desc + "\n");

    const mb = fs.statSync(final).size / 1e6;
    log.ok(`${path.relative(ROOT, final)}  (${mb.toFixed(1)} MB, rendered in ${formatTime((Date.now() - t0) / 1000)})`);
    results.push(final);
  }

  console.log(`\n${c.green("Done!")} Total time ${formatTime((Date.now() - started) / 1000)}. Your files:`);
  for (const r of results) {
    console.log(`  ${path.relative(ROOT, r)}`);
    console.log(c.dim(`  ${path.relative(ROOT, r.replace(/\.mp4$/, "-thumbnail.jpg"))}, ${path.relative(ROOT, r.replace(/\.mp4$/, "-description.txt"))}`));
  }
};

runMain(main);
