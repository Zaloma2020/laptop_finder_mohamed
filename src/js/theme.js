// theme.js - Performance Mode (dark) and Battery Saver Mode (light).
import { getSavedTheme, saveTheme } from "./storage.js";

export const THEMES = {
  performance: { label: "Performance", icon: "⚡" },
  battery: { label: "Battery Saver", icon: "🔋" },
};

// Puts the theme name on <html>; src/input.css swaps all colors from that attribute.
export const applyTheme = (name) => {
  const safeName = THEMES[name] ? name : "performance";
  document.documentElement.dataset.theme = safeName;
  return safeName;
};

// Restoring: runs on every page load, so the saved choice is kept after navigation or reload.
export const restoreTheme = () => applyTheme(getSavedTheme());

// Switches to the other theme, saves it and returns the new name.
export function toggleTheme() {
  const current = document.documentElement.dataset.theme || "performance";
  const next = current === "performance" ? "battery" : "performance";
  saveTheme(applyTheme(next));
  return next;
}
