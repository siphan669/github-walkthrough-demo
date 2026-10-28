// Runs after `npm install`: creates the Studio's preview plan
// (src/generated/plan.json, git-ignored) so the project bundles on a fresh
// checkout. `npm run studio -- <video>` replaces it with a real plan.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/util.mjs";

const file = path.join(ROOT, "src", "generated", "plan.json");
if (!fs.existsSync(file)) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const scene = {
    type: "title", title: "Video Factory", subtitle: "Run: npm run studio -- <video>", narration: "",
    index: 0, from: 0, durationInFrames: 150, narrationStart: 20, narrationFrames: 90, audioSrc: null,
  };
  const plan = {
    title: "Video Factory", channel: "", theme: "mystery", width: 1920, height: 1080, fps: 30,
    durationInFrames: 150, transitionFrames: 15, scenes: [scene], captions: [], captionsEnabled: true,
    music: null, voiceoverFull: null, whoosh: null, speechIntervals: [],
  };
  fs.writeFileSync(file, JSON.stringify(plan, null, 2));
}
