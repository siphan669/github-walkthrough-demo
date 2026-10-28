// Free, offline audio: text-to-speech with Piper or espeak-ng, and original
// background music / whoosh effects synthesised with FFmpeg. Nothing here
// calls a paid API or the network.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT, UserError, findFile, log, pad2, run, which } from "./util.mjs";
import { spokenText } from "./script.mjs";

export const recordedVoicePath = (dir, i) => findFile(path.join(dir, "audio", "recorded", `scene-${pad2(i + 1)}`));
export const fullVoicePath = (dir) => findFile(path.join(dir, "audio", "voiceover"));
export const generatedVoicePath = (dir, i) => path.join(dir, "audio", "generated", "voice", `scene-${pad2(i + 1)}.wav`);

const piperCommand = () => {
  if (which("piper")) return ["piper"];
  const venv = path.join(ROOT, ".venv", "bin", "piper");
  if (fs.existsSync(venv)) return [venv];
  return null;
};

const findPiperModel = (voice) => {
  if (voice.piperModel) {
    const p = path.resolve(ROOT, voice.piperModel);
    if (fs.existsSync(p)) return p;
    log.warn(`Piper model not found at ${voice.piperModel}`);
  }
  const dir = path.join(ROOT, "voices");
  const m = fs.existsSync(dir) ? fs.readdirSync(dir).find((f) => f.endsWith(".onnx")) : null;
  return m ? path.join(dir, m) : null;
};

// Decide which free TTS engine to use ("auto" picks the best installed one).
export const resolveEngine = (voice) => {
  const want = (voice.engine ?? "auto").toLowerCase();
  if (want === "none" || want === "off") return { engine: "none" };
  const piper = piperCommand();
  const model = findPiperModel(voice);
  if ((want === "auto" || want === "piper") && piper && model) return { engine: "piper", cmd: piper, model };
  if (want === "piper") {
    throw new UserError(
      "Voice engine is set to piper but Piper or its voice model is missing.",
      'Install: python3 -m venv .venv && .venv/bin/pip install piper-tts, then put a voice (.onnx + .onnx.json) from https://huggingface.co/rhasspy/piper-voices into voices/. Or set "engine": "espeak".',
    );
  }
  const espeak = which("espeak-ng") ?? which("espeak");
  if (espeak) return { engine: "espeak", cmd: [espeak] };
  if (want === "espeak") {
    throw new UserError("Voice engine is set to espeak but espeak-ng is not installed.", "Ubuntu: sudo apt install espeak-ng   macOS: brew install espeak-ng   Windows: https://github.com/espeak-ng/espeak-ng/releases");
  }
  return { engine: "none" };
};

const hashOf = (...parts) => crypto.createHash("sha1").update(parts.join("\u0000")).digest("hex").slice(0, 16);

// Creates audio/generated/voice/scene-XX.wav for scenes without a recording.
// Unchanged scenes are skipped thanks to a small hash file next to each clip.
export const generateVoice = (script, dir, { force = false } = {}) => {
  if (fullVoicePath(dir)) {
    log.ok(`Using your full voiceover file: ${path.relative(dir, fullVoicePath(dir))}`);
    return { engine: "recorded", generated: 0 };
  }
  if (script.scenes.every((_, i) => recordedVoicePath(dir, i))) {
    log.ok("Using your recorded voice clips for every scene.");
    return { engine: "recorded", generated: 0 };
  }
  const choice = resolveEngine(script.voice);
  if (choice.engine === "none") {
    log.warn("No voiceover: no recordings found and no free TTS engine installed (or voice engine is 'none').");
    log.info("The video will still render with captions timed to a natural reading speed.");
    return { engine: "none", generated: 0 };
  }
  let generated = 0;
  let reused = 0;
  let recorded = 0;
  script.scenes.forEach((scene, i) => {
    if (recordedVoicePath(dir, i)) return recorded++;
    const text = spokenText(scene.narration ?? "");
    if (!text) return;
    const out = generatedVoicePath(dir, i);
    const hashFile = out + ".hash";
    const settings = JSON.stringify({ ...script.voice, engine: choice.engine, model: choice.model ?? "" });
    const h = hashOf(text, settings);
    if (!force && fs.existsSync(out) && fs.existsSync(hashFile) && fs.readFileSync(hashFile, "utf8") === h) return reused++;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const raw = out.replace(/\.wav$/, ".raw.wav");
    if (choice.engine === "piper") {
      const [cmd, ...pre] = choice.cmd;
      run(cmd, [...pre, "-m", choice.model, "-f", raw], { input: text, label: `Piper (scene ${i + 1})` });
    } else {
      const [cmd] = choice.cmd;
      run(cmd, ["-v", script.voice.espeakVoice, "-s", String(script.voice.speed), "-p", String(script.voice.pitch), "-w", raw, text], {
        label: `espeak-ng (scene ${i + 1})`,
      });
    }
    // Light clean-up: remove rumble, warm the robotic edge a little, even loudness.
    const filter =
      choice.engine === "espeak"
        ? "highpass=f=80,lowpass=f=6500,aecho=0.8:0.5:35:0.12,loudnorm=I=-16:TP=-1.5:LRA=11"
        : "highpass=f=60,loudnorm=I=-16:TP=-1.5:LRA=11";
    run("ffmpeg", ["-y", "-v", "error", "-i", raw, "-af", filter, "-ar", "48000", "-ac", "1", out], { label: "Cleaning voice audio" });
    fs.rmSync(raw, { force: true });
    fs.writeFileSync(hashFile, h);
    generated++;
  });
  log.ok(
    `Voice (${choice.engine}): ${generated} new clip(s), ${reused} unchanged` + (recorded ? `, ${recorded} from your recordings` : ""),
  );
  return { engine: choice.engine, generated };
};

// Original ambient music: a slow minor chord progression with a drone and soft
// noise, synthesised from scratch so there are no copyright issues. 64s loop.
export const generateMusic = (dir, { force = false } = {}) => {
  const out = path.join(dir, "audio", "generated", "music.wav");
  if (!force && fs.existsSync(out)) return out;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // Am - F - C - G - Am - F - Dm - E  (8 s each)
  const chords = [
    [110, 130.81, 164.81],
    [87.31, 110, 130.81],
    [130.81, 164.81, 196],
    [98, 123.47, 146.83],
    [110, 130.81, 164.81],
    [87.31, 110, 130.81],
    [73.42, 87.31, 110],
    [82.41, 103.83, 123.47],
  ];
  const freqExpr = (n) => chords.reduceRight((acc, ch, k) => `if(eq(floor(t/8),${k}),${ch[n]},${acc})`, String(chords[0][n]));
  const env = "pow(sin(PI*mod(t,8)/8),0.7)";
  const pad = [0, 1, 2]
    .map((n) => `0.16*sin(2*PI*${freqExpr(n)}*t)*${env}+0.05*sin(4*PI*${freqExpr(n)}*t)*${env}`)
    .join("+");
  const drone = "0.12*sin(2*PI*55*t)*(0.75+0.25*sin(2*PI*t/16))";
  const expr = `${pad}+${drone}`;
  run(
    "ffmpeg",
    [
      "-y", "-v", "error",
      "-f", "lavfi", "-i", `aevalsrc='${expr}|${expr}':s=44100:d=64`,
      "-f", "lavfi", "-i", "anoisesrc=d=64:c=pink:a=0.05:s=44100",
      "-filter_complex",
      "[1:a]lowpass=f=500,pan=stereo|c0=c0|c1=c0[n];[0:a][n]amix=inputs=2:weights=1 0.6:normalize=0,lowpass=f=1800,aecho=0.8:0.85:400|800:0.35|0.25,afade=t=in:d=2,afade=t=out:st=62:d=2,loudnorm=I=-20[a]",
      "-map", "[a]", "-t", "64", "-ar", "44100", out,
    ],
    { label: "Generating background music" },
  );
  return out;
};

export const generateWhoosh = (dir, { force = false } = {}) => {
  const out = path.join(dir, "audio", "generated", "whoosh.wav");
  if (!force && fs.existsSync(out)) return out;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  run(
    "ffmpeg",
    [
      "-y", "-v", "error",
      "-f", "lavfi", "-i", "anoisesrc=d=0.8:c=pink:a=0.6:s=44100",
      "-af", "highpass=f=250,lowpass=f=2500,afade=t=in:d=0.35:curve=exp,afade=t=out:st=0.35:d=0.45,volume=0.9",
      out,
    ],
    { label: "Generating whoosh effect" },
  );
  return out;
};
