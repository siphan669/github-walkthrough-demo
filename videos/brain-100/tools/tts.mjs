// Generate one Kokoro TTS wav per script line into public/vo/ (cached by text+voice hash)
// and write story/lines.json with each file's duration.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { CHAPTERS, VOICES } from "../story/script.mjs";

const dir = "public/vo";
mkdirSync(dir, { recursive: true });
const manifestPath = "story/lines.json";
const prev = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const out = {};
for (const ch of CHAPTERS) {
  ch.lines.forEach(([spk, text], i) => {
    if (!spk) return;
    const id = `${ch.id}-${String(i).padStart(2, "0")}`;
    const { voice, speed } = VOICES[spk];
    const hash = createHash("sha1").update(`${voice}|${speed}|${text}`).digest("hex").slice(0, 10);
    const file = `vo/${id}.wav`;
    if (prev[id]?.hash === hash && existsSync(`public/${file}`)) { out[id] = prev[id]; return; }
    const res = JSON.parse(execFileSync("npx", ["hyperframes", "tts", text, "-v", voice, "-s", String(speed), "-o", `public/${file}`, "--json"], { encoding: "utf8" }).trim().split("\n").pop());
    out[id] = { hash, file, dur: res.durationSeconds };
    writeFileSync(manifestPath, JSON.stringify({ ...prev, ...out }, null, 1));
    console.log(id, res.durationSeconds);
  });
}
writeFileSync(manifestPath, JSON.stringify(out, null, 1));
const total = Object.values(out).reduce((a, b) => a + b.dur, 0);
console.log(`lines=${Object.keys(out).length} speech=${total.toFixed(1)}s`);
