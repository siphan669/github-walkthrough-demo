/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { existsSync, readdirSync } from "node:fs";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Cloud sessions can't download Remotion's browser (remotion.media is blocked), so reuse
// the headless Chrome that HyperFrames installs, when it is present.
const hfChrome = "/root/.cache/hyperframes/chrome/chrome-headless-shell";
if (existsSync(hfChrome)) {
  const v = readdirSync(hfChrome)[0];
  if (v) Config.setBrowserExecutable(`${hfChrome}/${v}/chrome-headless-shell-linux64/chrome-headless-shell`);
}
