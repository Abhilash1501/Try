import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, PHASES, clamp } from "./timeline";
import { BEAT_MS, SEG, ecgValue } from "./wave";

const W = 880;
const H = 450;
const PAD_X = 40;
const PX_PER_MS = (W - 2 * PAD_X) / BEAT_MS;
const BASELINE = 280;
const AMP = 200;
const SQUARE = 40 * PX_PER_MS; // one small ECG square = 0.04 s

const x = (ms: number) => PAD_X + ms * PX_PER_MS;
const y = (v: number) => BASELINE - v * AMP;

const pathBetween = (a: number, b: number) => {
  if (b <= a) return "";
  let d = `M ${x(a)} ${y(ecgValue(a))}`;
  for (let ms = Math.ceil(a); ms <= b; ms++) {
    d += ` L ${x(ms)} ${y(ecgValue(ms))}`;
  }
  d += ` L ${x(b)} ${y(ecgValue(b))}`;
  return d;
};

type SegKey = keyof typeof SEG;

const SEGMENTS: {
  key: SegKey;
  label: string;
  color: string;
  labelMs: number;
  labelV: number;
}[] = [
  { key: "p", label: "P", color: COLORS.p, labelMs: 85, labelV: 0.15 },
  { key: "pr", label: "PR", color: COLORS.pr, labelMs: 165, labelV: 0 },
  { key: "qrs", label: "QRS", color: COLORS.qrs, labelMs: 242, labelV: 1 },
  { key: "st", label: "ST", color: COLORS.st, labelMs: 340, labelV: 0 },
  { key: "t", label: "T", color: COLORS.t, labelMs: 492, labelV: 0.3 },
];

const ease = Easing.bezier(0.45, 0, 0.55, 1);

// How much of the beat (ms) the live pen has drawn at a given frame.
const drawnMs = (frame: number) =>
  interpolate(
    frame,
    [0, 95, 160, 245, 300, 365, 430, 515, 570, 635, 710, 785, 815],
    [0, 0, 130, 130, 200, 200, 290, 290, 390, 390, 560, 560, BEAT_MS],
    { ...clamp, easing: ease },
  );

const segmentOpacity = (frame: number, key: SegKey) => {
  const phase = PHASES[key];
  const own = interpolate(
    frame,
    [phase.from, phase.from + 10, phase.from + phase.dur - 8, phase.from + phase.dur],
    [0, 1, 1, 0],
    clamp,
  );
  const recap = interpolate(frame, [PHASES.recap.from + 20, PHASES.recap.from + 40], [0, 1], clamp);
  return Math.max(own, recap);
};

const Bracket: React.FC<{
  a: number;
  b: number;
  row: number;
  text: string;
  color: string;
  opacity: number;
  textBeside?: boolean;
}> = ({ a, b, row, text, color, opacity, textBeside }) => {
  const yy = row;
  return (
    <g opacity={opacity}>
      <line x1={x(a) + 2} x2={x(b) - 2} y1={yy} y2={yy} stroke={color} strokeWidth={4} />
      <line x1={x(a) + 2} x2={x(a) + 2} y1={yy - 10} y2={yy + 10} stroke={color} strokeWidth={4} />
      <line x1={x(b) - 2} x2={x(b) - 2} y1={yy - 10} y2={yy + 10} stroke={color} strokeWidth={4} />
      <text
        x={textBeside ? x(b) + 12 : (x(a) + x(b)) / 2}
        y={textBeside ? yy + 8 : yy + 32}
        fill={color}
        fontSize={23}
        fontWeight={700}
        textAnchor={textBeside ? "start" : "middle"}
      >
        {text}
      </text>
    </g>
  );
};

export const EcgTrace: React.FC = () => {
  const frame = useCurrentFrame();
  const drawn = drawnMs(frame);
  const ghost = interpolate(frame, [60, 130], [0, BEAT_MS], { ...clamp, easing: ease });
  const recapStart = PHASES.recap.from;

  const gridLines: React.ReactNode[] = [];
  for (let i = 0; i * SQUARE <= W; i++) {
    gridLines.push(
      <line
        key={`v${i}`}
        x1={PAD_X + i * SQUARE}
        x2={PAD_X + i * SQUARE}
        y1={0}
        y2={H}
        stroke={i % 5 === 0 ? COLORS.gridMajor : COLORS.grid}
        strokeWidth={i % 5 === 0 ? 2 : 1}
      />,
    );
  }
  for (let j = -7; j <= 4; j++) {
    const yy = BASELINE + j * SQUARE;
    if (yy < 0 || yy > H) continue;
    gridLines.push(
      <line
        key={`h${j}`}
        x1={0}
        x2={W}
        y1={yy}
        y2={yy}
        stroke={j % 5 === 0 ? COLORS.gridMajor : COLORS.grid}
        strokeWidth={j % 5 === 0 ? 2 : 1}
      />,
    );
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="box">
          <rect x={0} y={0} width={W} height={H} rx={18} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={W} height={H} rx={18} fill={COLORS.panel} />
      <g clipPath="url(#box)">{gridLines}</g>

      <text x={W - 24} y={40} fill={COLORS.dim} fontSize={22} fontWeight={600} letterSpacing={2} textAnchor="end">
        LEAD II · ONE BEAT
      </text>

      {/* Faint full beat, so the viewer sees where we are going */}
      <path
        d={pathBetween(0, ghost)}
        fill="none"
        stroke={COLORS.trace}
        strokeOpacity={0.16}
        strokeWidth={4}
        strokeLinejoin="round"
      />

      {/* Live pen */}
      <path
        d={pathBetween(0, drawn)}
        fill="none"
        stroke={COLORS.trace}
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {SEGMENTS.map((s) => {
        const [a, b] = SEG[s.key];
        const o = segmentOpacity(frame, s.key);
        if (o <= 0 || drawn <= a) return null;
        return (
          <g key={s.key} opacity={o}>
            <path
              d={pathBetween(a, Math.min(b, drawn))}
              fill="none"
              stroke={s.color}
              strokeWidth={8}
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            <text
              x={x(s.labelMs)}
              y={y(s.labelV) - 26}
              fill={s.color}
              fontSize={s.key === "qrs" ? 34 : 32}
              fontWeight={800}
              textAnchor="middle"
              opacity={interpolate(drawn, [a, Math.min(b, a + 30)], [0, 1], clamp)}
            >
              {s.label}
            </text>
          </g>
        );
      })}

      {/* Pen tip */}
      {drawn > 0 && drawn < BEAT_MS ? (
        <circle
          cx={x(drawn)}
          cy={y(ecgValue(drawn))}
          r={9}
          fill="#ffffff"
          filter="url(#glow)"
        />
      ) : null}

      <Bracket
        a={SEG.p[0]}
        b={SEG.qrs[0]}
        row={345}
        text="PR 0.12–0.20 s"
        color={COLORS.pr}
        opacity={interpolate(frame, [recapStart + 35, recapStart + 50], [0, 1], clamp)}
      />
      <Bracket
        a={SEG.qrs[0]}
        b={SEG.qrs[1]}
        row={345}
        text="QRS < 0.12 s"
        textBeside
        color={COLORS.qrs}
        opacity={interpolate(frame, [recapStart + 45, recapStart + 60], [0, 1], clamp)}
      />
      <Bracket
        a={SEG.qrs[0]}
        b={SEG.t[1]}
        row={398}
        text="QT interval ≈ 0.36–0.44 s"
        color={COLORS.t}
        opacity={interpolate(frame, [recapStart + 55, recapStart + 70], [0, 1], clamp)}
      />
    </svg>
  );
};
