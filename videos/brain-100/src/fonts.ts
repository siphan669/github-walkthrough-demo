import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Local copies of the fonts the earlier episodes used, so renders work offline.
export const fontsLoaded = Promise.all([
  loadFont({ family: "League Gothic", url: staticFile("fonts/league-gothic.woff2") }),
  loadFont({ family: "Space Mono", url: staticFile("fonts/space-mono.woff2"), weight: "400" }),
  loadFont({ family: "Space Mono", url: staticFile("fonts/space-mono-700.woff2"), weight: "700" }),
]);
