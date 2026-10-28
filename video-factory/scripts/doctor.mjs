// npm run doctor — checks that everything needed to render is installed.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveEngine } from "./lib/audio.mjs";
import { ROOT, c, findBrowser, run, which } from "./lib/util.mjs";

let problems = 0;
const ok = (m) => console.log(`  ${c.green("✔")} ${m}`);
const bad = (m, fix) => {
  problems++;
  console.log(`  ${c.red("✖")} ${m}\n      ${c.yellow("Fix:")} ${fix}`);
};
const note = (m) => console.log(`  ${c.yellow("•")} ${m}`);

console.log(c.bold("\nVideo Factory — environment check\n"));
const major = Number(process.versions.node.split(".")[0]);
major >= 18 ? ok(`Node.js ${process.versions.node}`) : bad(`Node.js ${process.versions.node} is too old`, "Install Node 18+ from https://nodejs.org");
fs.existsSync(path.join(ROOT, "node_modules", "remotion")) ? ok("npm packages installed") : bad("npm packages missing", "Run: npm install");
if (which("ffmpeg") && which("ffprobe")) ok(run("ffmpeg", ["-version"]).split("\n")[0]);
else bad("FFmpeg not found", "macOS: brew install ffmpeg · Ubuntu: sudo apt install ffmpeg · Windows: winget install ffmpeg");
const browser = findBrowser();
browser ? ok(`Browser: ${browser}`) : note("No local Chromium — Remotion downloads its free headless browser on the first render (needs internet once).");

const tts = resolveEngine({ engine: "auto" });
if (tts.engine === "piper") ok(`Voice: Piper (natural, free) with ${path.basename(tts.model)}`);
else if (tts.engine === "espeak") note("Voice: espeak-ng (free, robotic). For a natural free voice install Piper — see README › Better free voice.");
else note("Voice: no free TTS installed — videos render with captions only unless you add recordings. Install espeak-ng or Piper.");

const cpus = os.cpus().length;
const gb = os.totalmem() / 1e9;
ok(`${cpus} CPU cores, ${gb.toFixed(0)} GB RAM`);
if (gb < 6) note("Low memory: render with --concurrency 2 if renders crash.");

console.log(problems ? c.red(`\n${problems} problem(s) to fix.\n`) : c.green("\nAll good — you can render videos!\n"));
process.exit(problems ? 1 : 0);
