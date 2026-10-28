// Shapes shared by the Remotion components. The Node pipeline
// (scripts/lib/plan.mjs) builds a `VideoPlan` from a script file and passes
// it to the composition as input props.

export type BackgroundKind =
  | "ocean"
  | "stars"
  | "fog"
  | "grid"
  | "embers"
  | "paper"
  | "storm";

export type TransitionKind =
  | "fade"
  | "slide"
  | "wipe"
  | "flip"
  | "clock"
  | "iris"
  | "none";

export type Pose =
  | "idle"
  | "walk"
  | "run"
  | "point"
  | "think"
  | "shock"
  | "shrug"
  | "wave"
  | "scared"
  | "cheer";

export type Hat = "none" | "captain" | "sailor" | "detective" | "bow";
export type Mood = "neutral" | "happy" | "worried" | "shocked" | "sad";

export type PropKind =
  | "ship"
  | "barrel"
  | "lifeboat"
  | "question"
  | "lightbulb"
  | "magnifier"
  | "compass"
  | "scroll"
  | "lightning"
  | "cloud"
  | "skull"
  | "book";

export type Figure = {
  pose?: Pose;
  x?: number; // 0..1 across the frame
  color?: string;
  hat?: Hat;
  mood?: Mood;
  facing?: "left" | "right";
  label?: string;
  say?: string;
  enter?: "walk" | "pop" | "none";
  scale?: number;
};

export type SceneProp = {
  kind: PropKind;
  x?: number;
  y?: number; // 0..1 down the frame (ground is ~0.78)
  scale?: number;
  label?: string;
};

export type ChartDatum = { label: string; value: number; color?: string };
export type TimelineEvent = { date: string; label: string };
export type MapMarker = { lon: number; lat: number; label?: string };

export type SceneSpec = {
  type:
    | "title"
    | "stickfigure"
    | "map"
    | "timeline"
    | "chart"
    | "stat"
    | "quote"
    | "list"
    | "text"
    | "question"
    | "outro";
  narration: string;
  chapter?: string; // starts a YouTube chapter at this scene
  short?: boolean; // include this scene in the vertical Short cut
  background?: BackgroundKind;
  transition?: TransitionKind;
  // free-form, type-specific fields:
  title?: string;
  subtitle?: string;
  kicker?: string;
  headline?: string;
  body?: string;
  text?: string;
  author?: string;
  items?: string[];
  figures?: Figure[];
  props?: SceneProp[];
  ground?: "land" | "deck" | "water" | "none";
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  route?: [number, number][];
  highlightCountries?: string[];
  events?: TimelineEvent[];
  chartType?: "bar" | "line" | "donut";
  data?: ChartDatum[];
  unit?: string;
  value?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  cta?: string;
};

export type CaptionWord = {
  text: string; // as displayed
  highlight: boolean;
  start: number; // absolute frame
  end: number;
  chunk: number;
};

export type PlannedScene = SceneSpec & {
  index: number;
  from: number; // absolute start frame (includes transition overlap)
  durationInFrames: number;
  narrationStart: number; // local frame inside the scene where speech starts
  narrationFrames: number;
  audioSrc: string | null; // relative to the video folder (staticFile)
};

export type ThemeName = "mystery" | "cosmic" | "archive";

export type VideoPlan = {
  title: string;
  channel: string;
  theme: ThemeName;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  transitionFrames: number;
  scenes: PlannedScene[];
  captions: CaptionWord[];
  captionsEnabled: boolean;
  music: { src: string; volume: number; duckedVolume: number } | null;
  voiceoverFull: { src: string; start: number } | null;
  whoosh: { src: string; volume: number } | null;
  speechIntervals: [number, number][]; // absolute frames, for music ducking
};
