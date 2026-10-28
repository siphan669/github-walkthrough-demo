// Settings used by `npm run studio` and the Remotion CLI.
// The automated pipeline (scripts/render.mjs) passes its own options.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(null);
