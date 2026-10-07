// One schematic beat of a lead II ECG, time in milliseconds.
export const SEG = {
  p: [40, 130],
  pr: [130, 200],
  qrs: [200, 290],
  st: [290, 390],
  t: [390, 560],
} as const;

export const BEAT_MS = 700;

const QRS_POINTS: [number, number][] = [
  [200, 0],
  [215, -0.08],
  [242, 1],
  [268, -0.25],
  [290, 0],
];

export const ecgValue = (ms: number): number => {
  if (ms >= SEG.p[0] && ms <= SEG.p[1]) {
    return 0.15 * Math.sin((Math.PI * (ms - SEG.p[0])) / (SEG.p[1] - SEG.p[0]));
  }
  if (ms >= SEG.qrs[0] && ms <= SEG.qrs[1]) {
    for (let i = 0; i < QRS_POINTS.length - 1; i++) {
      const [x0, y0] = QRS_POINTS[i];
      const [x1, y1] = QRS_POINTS[i + 1];
      if (ms >= x0 && ms <= x1) {
        return y0 + ((ms - x0) / (x1 - x0)) * (y1 - y0);
      }
    }
  }
  if (ms >= SEG.t[0] && ms <= SEG.t[1]) {
    // Slow upstroke, steeper downstroke (peak at ~60%).
    const u = (ms - SEG.t[0]) / (SEG.t[1] - SEG.t[0]);
    return 0.3 * Math.sin(Math.PI * Math.pow(u, 1.36));
  }
  return 0;
};
