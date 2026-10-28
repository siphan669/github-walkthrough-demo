import React from "react";
import type { PlannedScene } from "../types";
import { OutroScene, QuestionScene, QuoteScene, TextScene, TitleScene } from "./TextScenes";
import { StickScene } from "./StickScene";
import { ChartScene, ListScene, MapScene, StatScene, TimelineScene } from "./DataScenes";

// Scene type in the script -> React template. Add new templates here.
const REGISTRY: Record<PlannedScene["type"], React.FC<{ scene: PlannedScene }>> = {
  title: TitleScene,
  stickfigure: StickScene,
  map: MapScene,
  timeline: TimelineScene,
  chart: ChartScene,
  stat: StatScene,
  quote: QuoteScene,
  list: ListScene,
  text: TextScene,
  question: QuestionScene,
  outro: OutroScene,
};

export const SceneRenderer: React.FC<{ scene: PlannedScene }> = ({ scene }) => {
  const Component = REGISTRY[scene.type] ?? TextScene;
  return <Component scene={scene} />;
};
