// Global frame layout of the 30 s video (30 fps).
export const FPS = 30;

export const PHASES = {
  intro: { from: 0, dur: 90 },
  p: { from: 90, dur: 150 },
  pr: { from: 240, dur: 120 },
  qrs: { from: 360, dur: 150 },
  st: { from: 510, dur: 120 },
  t: { from: 630, dur: 150 },
  recap: { from: 780, dur: 120 },
} as const;

export const TOTAL_FRAMES = 900;

export const COLORS = {
  bg: "#0a0f1c",
  panel: "#111a2e",
  grid: "#1b2a45",
  gridMajor: "#26395c",
  text: "#eef2f8",
  dim: "#93a1b8",
  trace: "#e8eef7",
  chamber: "#3a1622",
  chamberStroke: "#f0607a",
  active: "#ffb547",
  conduction: "#ffd166",
  conductionDim: "#5c4d2a",
  p: "#ffb547",
  pr: "#b69bff",
  qrs: "#ff5c7a",
  st: "#4fd1c5",
  t: "#60a5fa",
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
