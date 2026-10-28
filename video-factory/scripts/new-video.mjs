// npm run new -- my-topic [--txt]   creates videos/my-topic from a template.
import fs from "node:fs";
import path from "node:path";
import { TEMPLATES_DIR, UserError, VIDEOS_DIR, c, parseArgs, runMain } from "./lib/util.mjs";

runMain(async () => {
  const args = parseArgs(process.argv.slice(2));
  const raw = args._[0];
  if (!raw) throw new UserError("Please give the new video a folder name.", "Example: npm run new -- dyatlov-pass");
  const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const dir = path.join(VIDEOS_DIR, slug);
  if (fs.existsSync(dir)) throw new UserError(`videos/${slug} already exists.`, "Pick another name or edit the existing script.");
  const useTxt = Boolean(args.txt);
  const tpl = path.join(TEMPLATES_DIR, useTxt ? "script-template.txt" : "script-template.json");
  fs.mkdirSync(path.join(dir, "audio", "recorded"), { recursive: true });
  fs.copyFileSync(tpl, path.join(dir, useTxt ? "script.txt" : "script.json"));
  fs.writeFileSync(
    path.join(dir, "audio", "README.txt"),
    [
      "Optional audio for this video (all free to leave empty):",
      "",
      "  music.mp3                 your own background music (otherwise an original track is generated)",
      "  voiceover.mp3             ONE recording of the whole script, read in order",
      "  recorded/scene-01.mp3     OR one recording per scene (scene-02.mp3, ...)",
      "  whoosh.wav                your own transition sound",
      "",
      "Without recordings, a free offline voice (Piper or espeak-ng) reads the script.",
      "",
    ].join("\n"),
  );
  console.log(`${c.green("✔")} Created videos/${slug}/`);
  console.log(`\nNext steps:\n  1. Edit videos/${slug}/${useTxt ? "script.txt" : "script.json"}\n  2. npm run check -- ${slug}\n  3. npm run make -- ${slug} --preview\n  4. npm run make -- ${slug} --format both`);
});
