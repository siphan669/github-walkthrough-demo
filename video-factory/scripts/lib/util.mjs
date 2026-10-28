// Shared helpers for the pipeline scripts: paths, logging, friendly errors,
// running external tools (ffmpeg, espeak-ng, piper) and finding a browser.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const VIDEOS_DIR = path.join(ROOT, "videos");
export const OUT_DIR = path.join(ROOT, "out");
export const TEMPLATES_DIR = path.join(ROOT, "templates");

const color = (code) => (s) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
export const c = { green: color(32), yellow: color(33), red: color(31), cyan: color(36), dim: color(2), bold: color(1) };

export const log = {
  step: (msg) => console.log(`\n${c.cyan("▶")} ${c.bold(msg)}`),
  info: (msg) => console.log(`  ${msg}`),
  ok: (msg) => console.log(`  ${c.green("✔")} ${msg}`),
  warn: (msg) => console.log(`  ${c.yellow("⚠")} ${msg}`),
};

// An error with a beginner-friendly explanation and a suggested fix.
export class UserError extends Error {
  constructor(message, hint) {
    super(message);
    this.hint = hint;
  }
}

// Wrap a script's main() so every failure ends with a clear message.
export const runMain = (main) => {
  process.on("SIGINT", () => {
    console.log(c.yellow("\nStopped by user (Ctrl+C)."));
    process.exit(130);
  });
  main().catch((err) => {
    console.error(`\n${c.red("✖ " + (err.message || String(err)))}`);
    if (err.hint) console.error(`  ${c.yellow("How to fix:")} ${err.hint}`);
    else if (!(err instanceof UserError) && err.stack) console.error(c.dim(err.stack.split("\n").slice(1, 6).join("\n")));
    process.exit(1);
  });
};

// Options that are simple on/off switches and never take a value.
const SWITCHES = new Set(["preview", "no-voice", "no-music", "force-voice", "txt"]);

export const parseArgs = (argv) => {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      if (v !== undefined) args[k] = v;
      else if (SWITCHES.has(k)) args[k] = true;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) args[k] = argv[++i];
      else args[k] = true;
    } else args._.push(a);
  }
  return args;
};

export const which = (cmd) => {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.split(/\r?\n/)[0].trim() : null;
};

// Run a command; throw a UserError with its stderr on failure.
export const run = (cmd, args, { input, label } = {}) => {
  const r = spawnSync(cmd, args, { input, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new UserError(`Could not start "${cmd}": ${r.error.message}`, `Is ${cmd} installed? Run "npm run doctor".`);
  if (r.status !== 0) {
    const tail = (r.stderr || r.stdout || "").trim().split("\n").slice(-8).join("\n");
    throw new UserError(`${label ?? cmd} failed (exit ${r.status}):\n${tail}`);
  }
  return r.stdout;
};

export const requireFfmpeg = () => {
  if (!which("ffmpeg") || !which("ffprobe")) {
    throw new UserError(
      "FFmpeg is not installed (needed for audio and final encoding).",
      "Install it for free: macOS `brew install ffmpeg`, Ubuntu `sudo apt install ffmpeg`, Windows `winget install ffmpeg`.",
    );
  }
};

export const probeDuration = (file) => {
  const out = run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], {
    label: `Reading audio file ${path.basename(file)}`,
  });
  const d = parseFloat(out);
  if (!Number.isFinite(d) || d <= 0) throw new UserError(`Audio file looks empty or broken: ${file}`, "Re-export it as MP3 or WAV.");
  return d;
};

// Find the first existing file among candidate extensions.
export const findFile = (base, exts = [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"]) => {
  for (const e of exts) if (fs.existsSync(base + e)) return base + e;
  return null;
};

// Remotion normally downloads its own headless Chrome (free, one time). If a
// local Chromium is available (or REMOTION_BROWSER_EXECUTABLE is set) use it.
export const findBrowser = () => {
  if (process.env.REMOTION_BROWSER_EXECUTABLE) return process.env.REMOTION_BROWSER_EXECUTABLE;
  const roots = ["/opt/pw-browsers"];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    for (const d of fs.readdirSync(r).filter((x) => x.startsWith("chromium_headless_shell")).sort().reverse()) {
      for (const sub of ["chrome-headless-shell-linux64", "chrome-linux"]) {
        const p = path.join(r, d, sub, "chrome-headless-shell");
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
};

export const pad2 = (n) => String(n).padStart(2, "0");

export const formatTime = (sec) => {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return (h ? `${h}:${pad2(m)}` : `${m}`) + `:${pad2(s % 60)}`;
};

export const videoDir = (slug) => {
  if (!slug) {
    const list = fs.existsSync(VIDEOS_DIR) ? fs.readdirSync(VIDEOS_DIR).filter((d) => !d.startsWith(".")) : [];
    throw new UserError(
      "Please name the video folder to use.",
      `Example: npm run make -- mary-celeste   (available: ${list.join(", ") || "none yet — run npm run new -- my-topic"})`,
    );
  }
  const dir = path.join(VIDEOS_DIR, slug);
  if (!fs.existsSync(dir)) throw new UserError(`No video folder "videos/${slug}".`, `Create one with: npm run new -- ${slug}`);
  return dir;
};
