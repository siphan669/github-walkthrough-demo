import { Composition, continueRender, delayRender } from "remotion";
import { Video } from "./Video";
import type { VideoPlan } from "./types";
// Written by `npm run studio -- <video>` / `npm run render`; a committed copy
// of the sample plan keeps the Studio working on a fresh checkout.
import previewPlan from "./generated/plan.json";

// Wait for the bundled fonts before any frame is captured.
if (typeof document !== "undefined") {
  const handle = delayRender("Loading fonts");
  document.fonts.ready.then(() => continueRender(handle));
}

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Video"
      component={Video}
      defaultProps={{ plan: previewPlan as unknown as VideoPlan }}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.plan.durationInFrames,
        fps: props.plan.fps,
        width: props.plan.width,
        height: props.plan.height,
      })}
    />
  );
};
