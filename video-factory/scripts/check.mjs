// npm run check -- my-topic   validates a script and estimates its length.
import { buildPlan } from "./lib/plan.mjs";
import { loadScript } from "./lib/script.mjs";
import { c, formatTime, log, requireFfmpeg, runMain, videoDir } from "./lib/util.mjs";
import { tokenize } from "./lib/plan.mjs";

runMain(async () => {
  const slug = process.argv[2];
  const dir = videoDir(slug);
  requireFfmpeg();
  const { script, warnings } = loadScript(dir);
  warnings.forEach((w) => log.warn(w));
  const plan = buildPlan({ script, dir, format: "landscape" });
  const words = script.scenes.reduce((a, s) => a + tokenize(s.narration ?? "").length, 0);
  log.ok(`"${script.title}": ${script.scenes.length} scenes, ${words} words`);
  const sec = plan.durationInFrames / plan.fps;
  const timed = plan.scenes.some((s) => s.audioSrc) || plan.voiceoverFull ? "from audio" : "estimated";
  log.ok(`Length: ${formatTime(sec)} (${timed})`);
  if (sec < 360) log.warn(`Shorter than 6:00 — add about ${Math.ceil(((360 - sec) / 60) * script.wordsPerMinute)} words.`);
  if (sec > 600) log.warn(`Longer than 10:00 — cut about ${Math.ceil(((sec - 600) / 60) * script.wordsPerMinute)} words.`);
  plan.scenes.forEach((s) =>
    console.log(c.dim(`    ${String(s.index + 1).padStart(2)}. ${formatTime(s.from / plan.fps).padStart(5)}  ${s.type.padEnd(11)} ${(s.narrationFrames / plan.fps).toFixed(1)}s`)),
  );
  console.log(c.green("\nScript looks good."));
});
