// npm run studio -- my-topic [--format vertical]
// Opens the Remotion Studio (live preview in your browser) for one video.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildPlan } from "./lib/plan.mjs";
import { findFile, ROOT, parseArgs, runMain, videoDir } from "./lib/util.mjs";
import { loadScript } from "./lib/script.mjs";

runMain(async () => {
  const args = parseArgs(process.argv.slice(2));
  const dir = videoDir(args._[0]);
  const { script } = loadScript(dir);
  const music = script.music.file ? path.resolve(dir, script.music.file) : findFile(path.join(dir, "audio", "music")) ?? findFile(path.join(dir, "audio", "generated", "music"), [".wav"]);
  if (music && fs.existsSync(music)) script._musicFile = music;
  script._whooshFile = findFile(path.join(dir, "audio", "whoosh")) ?? findFile(path.join(dir, "audio", "generated", "whoosh"), [".wav"]);
  const plan = buildPlan({ script, dir, format: String(args.format ?? "landscape") });
  fs.writeFileSync(path.join(ROOT, "src", "generated", "plan.json"), JSON.stringify(plan, null, 2));
  console.log("Tip: run `npm run make` once first so voice clips exist; the Studio shows what is already generated.");
  spawn("npx", ["remotion", "studio", "src/index.ts", "--public-dir", dir], { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
});
