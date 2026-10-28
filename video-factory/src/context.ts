import { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import { getTheme, type Theme } from "./theme";

export const ThemeContext = createContext<Theme>(getTheme("mystery"));
export const useTheme = () => useContext(ThemeContext);

// Layout helper: every scene supports 16:9 and 9:16 by asking this hook.
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return {
    width,
    height,
    vertical,
    // usable "safe" area (keeps text away from YouTube UI overlays)
    padX: vertical ? 70 : 140,
    padTop: vertical ? 220 : 90,
    // captions occupy the band below this y
    captionTop: vertical ? height * 0.66 : height * 0.8,
  };
};
