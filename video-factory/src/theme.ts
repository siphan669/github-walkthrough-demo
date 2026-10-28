import type { ThemeName } from "./types";

export type Theme = {
  bgTop: string;
  bgBottom: string;
  text: string;
  muted: string;
  accent: string; // UI accents, lines, markers
  highlight: string; // highlighted caption words
  danger: string;
  land: string;
  water: string;
  figure: string;
  displayFont: string;
  bodyFont: string;
  palette: string[]; // chart series
};

const display = "'Bebas Neue', 'Inter', sans-serif";
const body = "'Inter', 'DejaVu Sans', sans-serif";

export const THEMES: Record<ThemeName, Theme> = {
  mystery: {
    bgTop: "#0b1a2e",
    bgBottom: "#02060d",
    text: "#f3efe6",
    muted: "#8fa3b8",
    accent: "#f2b134",
    highlight: "#ffd166",
    danger: "#e5484d",
    land: "#24384f",
    water: "#0a1626",
    figure: "#f3efe6",
    displayFont: display,
    bodyFont: body,
    palette: ["#f2b134", "#4cc9f0", "#e5484d", "#80ed99", "#c77dff", "#ff8fab"],
  },
  cosmic: {
    bgTop: "#1a0b2e",
    bgBottom: "#05020d",
    text: "#f1ecff",
    muted: "#a497c7",
    accent: "#7df9ff",
    highlight: "#ff6bd6",
    danger: "#ff5470",
    land: "#2d1f4a",
    water: "#0d0620",
    figure: "#f1ecff",
    displayFont: display,
    bodyFont: body,
    palette: ["#7df9ff", "#ff6bd6", "#ffd166", "#80ed99", "#a78bfa", "#ff8f5a"],
  },
  archive: {
    bgTop: "#2b2118",
    bgBottom: "#120c07",
    text: "#f6ead3",
    muted: "#bfa98a",
    accent: "#e09f3e",
    highlight: "#ffcf70",
    danger: "#c8553d",
    land: "#5b4636",
    water: "#1e1610",
    figure: "#f6ead3",
    displayFont: display,
    bodyFont: body,
    palette: ["#e09f3e", "#9ec1a3", "#c8553d", "#70a9a1", "#f6ead3", "#b56576"],
  },
};

export const getTheme = (name: ThemeName | undefined): Theme =>
  THEMES[name ?? "mystery"] ?? THEMES.mystery;
