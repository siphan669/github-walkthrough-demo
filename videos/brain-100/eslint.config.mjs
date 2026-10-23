import { config } from "@remotion/eslint-config-flat";

export default [
  // src/lib/art.mjs is the shared SVG art module copied from the HyperFrames episodes.
  { ignores: ["src/lib/art.mjs"] },
  ...config,
];
