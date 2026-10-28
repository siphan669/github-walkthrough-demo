import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { iris } from "@remotion/transitions/iris";
import { none } from "@remotion/transitions/none";
import { ThemeContext } from "./context";
import { getTheme } from "./theme";
import type { TransitionKind, VideoPlan } from "./types";
import { SceneRenderer } from "./scenes";
import { Captions } from "./components/Captions";
import { Overlay } from "./components/Overlay";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentationFor = (kind: TransitionKind, width: number, height: number): TransitionPresentation<any> => {
  switch (kind) {
    case "slide":
      return slide({ direction: "from-right" });
    case "wipe":
      return wipe({ direction: "from-left" });
    case "flip":
      return flip({ direction: "from-right" });
    case "clock":
      return clockWipe({ width, height });
    case "iris":
      return iris({ width, height });
    case "none":
      return none();
    case "fade":
    default:
      return fade();
  }
};

// Music volume dips while the narrator is speaking.
const useMusicVolume = (plan: VideoPlan) => {
  return (f: number) => {
    if (!plan.music) return 0;
    let duck = 0;
    for (const [s, e] of plan.speechIntervals) {
      if (f < s - 12 || f > e + 18) continue;
      duck = Math.max(
        duck,
        interpolate(f, [s - 12, s, e, e + 18], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      );
    }
    const { volume, duckedVolume } = plan.music;
    const v = volume - (volume - duckedVolume) * duck;
    const fadeInOut = interpolate(
      f,
      [0, 45, plan.durationInFrames - 90, plan.durationInFrames],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return v * fadeInOut;
  };
};

export const Video: React.FC<{ plan: VideoPlan }> = ({ plan }) => {
  const { width, height } = useVideoConfig();
  const theme = getTheme(plan.theme);
  const musicVolume = useMusicVolume(plan);
  const T = plan.transitionFrames;

  return (
    <ThemeContext.Provider value={theme}>
      <AbsoluteFill style={{ backgroundColor: theme.bgBottom }}>
        <TransitionSeries>
          {plan.scenes.flatMap((scene, i) => {
            const items = [];
            if (i > 0) {
              items.push(
                <TransitionSeries.Transition
                  key={`t${i}`}
                  presentation={presentationFor(scene.transition ?? "fade", width, height)}
                  timing={linearTiming({ durationInFrames: T })}
                />,
              );
            }
            items.push(
              <TransitionSeries.Sequence
                key={`s${i}`}
                durationInFrames={scene.durationInFrames}
                name={`${i + 1}. ${scene.type}`}
              >
                <SceneRenderer scene={scene} />
              </TransitionSeries.Sequence>,
            );
            return items;
          })}
        </TransitionSeries>

        <Overlay plan={plan} />
        {plan.captionsEnabled ? <Captions words={plan.captions} /> : null}

        {/* Per-scene voiceover clips */}
        {plan.scenes.map((s) =>
          s.audioSrc ? (
            <Sequence
              key={`vo${s.index}`}
              from={s.from + s.narrationStart}
              durationInFrames={s.narrationFrames + 15}
              name={`voice ${s.index + 1}`}
              layout="none"
            >
              <Html5Audio src={staticFile(s.audioSrc)} />
            </Sequence>
          ) : null,
        )}

        {/* One long voiceover file instead of per-scene clips */}
        {plan.voiceoverFull ? (
          <Sequence from={plan.voiceoverFull.start} layout="none" name="voiceover">
            <Html5Audio src={staticFile(plan.voiceoverFull.src)} />
          </Sequence>
        ) : null}

        {plan.music ? (
          <Html5Audio src={staticFile(plan.music.src)} loop volume={musicVolume} />
        ) : null}

        {plan.whoosh
          ? plan.scenes.slice(1).map((s) => (
              <Sequence
                key={`wh${s.index}`}
                from={Math.max(0, s.from - 4)}
                durationInFrames={30}
                layout="none"
                name="whoosh"
              >
                <Html5Audio src={staticFile(plan.whoosh!.src)} volume={plan.whoosh!.volume} />
              </Sequence>
            ))
          : null}
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
