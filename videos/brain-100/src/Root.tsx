import { Composition } from "remotion";
import "./fonts";
import { DURATION_SECONDS, Video } from "./Video";

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="BrainAt100"
    component={Video}
    durationInFrames={Math.round(DURATION_SECONDS * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
