import React from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, PHASES, clamp } from "./timeline";

// Simplified frontal schematic, viewer's left = patient's right.
const RA = "M 200 90 C 280 90 300 150 295 280 L 105 280 C 80 200 110 90 200 90 Z";
const LA = "M 400 80 C 490 80 520 170 500 280 L 305 280 C 300 150 320 80 400 80 Z";
const RV = "M 100 292 L 295 292 L 295 588 C 200 540 88 440 100 292 Z";
const LV = "M 305 292 L 512 292 C 528 430 425 548 305 602 Z";
const SVC = "M 150 20 L 205 20 L 205 100 L 150 110 Z";

const SA = { x: 178, y: 112 };
const AV = { x: 290, y: 268 };

const INTERNODAL = `M ${SA.x} ${SA.y} Q 232 200 ${AV.x} ${AV.y}`;
const BACHMANN = `M ${SA.x} ${SA.y} Q 300 118 440 150`;
const HIS = `M ${AV.x} ${AV.y} L 300 302`;
const RBB = "M 300 302 Q 286 322 286 362 L 286 538";
const LBB = "M 300 302 Q 316 322 316 362 L 316 538";
const PURK_R = "M 286 538 Q 272 588 222 548 Q 142 472 120 330";
const PURK_L = "M 316 538 Q 332 592 392 548 Q 482 472 494 330";

const pointAt = (d: string, p: number) =>
  getPointAtLength(d, getLength(d) * Math.min(1, Math.max(0, p)));

const Dot: React.FC<{ d: string; p: number; r?: number }> = ({ d, p, r = 13 }) => {
  const pt = pointAt(d, p);
  if (!pt) return null;
  return <circle cx={pt.x} cy={pt.y} r={r} fill="#fff" filter="url(#hglow)" />;
};

const Wire: React.FC<{ d: string; p: number }> = ({ d, p }) => (
  <>
    <path d={d} fill="none" stroke={COLORS.conductionDim} strokeWidth={6} strokeLinecap="round" />
    <path
      d={d}
      fill="none"
      stroke={COLORS.conduction}
      strokeWidth={7}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
      filter="url(#hglow)"
      opacity={p > 0 ? 1 : 0}
    />
  </>
);

const Label: React.FC<{
  anchor: { x: number; y: number };
  at: { x: number; y: number };
  text: string;
  side: "left" | "right";
  opacity: number;
}> = ({ anchor, at, text, side, opacity }) => (
  <g opacity={opacity}>
    <line x1={anchor.x} y1={anchor.y} x2={at.x} y2={at.y} stroke={COLORS.text} strokeWidth={2} />
    <circle cx={anchor.x} cy={anchor.y} r={6} fill={COLORS.text} />
    <text
      x={side === "left" ? at.x - 12 : at.x + 12}
      y={at.y + 10}
      fill={COLORS.text}
      fontSize={30}
      fontWeight={700}
      textAnchor={side === "left" ? "end" : "start"}
    >
      {text}
    </text>
  </g>
);

const squeeze = (cx: number, cy: number, s: number) =>
  `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;

// Fully visible during its own phase, dimmed afterwards, hidden in the recap.
const labelOpacity = (frame: number, from: number) =>
  interpolate(
    frame,
    [from, from + 12, PHASES.st.from, PHASES.st.from + 15, PHASES.recap.from, PHASES.recap.from + 15],
    [0, 1, 1, 0.55, 0.55, 0],
    clamp,
  );

export const Heart: React.FC = () => {
  const f = useCurrentFrame();

  // P wave: depolarization spreads from the SA node across both atria.
  const atriaSpread = interpolate(f, [100, 185], [0, 400], clamp);
  // Atrial repolarization happens during (and is hidden by) the QRS.
  const atriaOn = interpolate(f, [380, 440], [0.85, 0], clamp);
  const atriaScale = interpolate(f, [195, 250, 330, 380], [1, 0.94, 0.94, 1], clamp);

  // QRS: depolarization spreads from the septum outward through the ventricles.
  const ventSpread = interpolate(f, [388, 455], [0, 270], clamp);
  // T wave: ventricles repolarize.
  const ventOn = interpolate(f, [650, 740], [0.85, 0], clamp);
  const ventScale = interpolate(f, [440, 520, 670, 760], [1, 0.92, 0.92, 1], clamp);

  const internodal = interpolate(f, [100, 185], [0, 1], clamp);
  const his = interpolate(f, [362, 380], [0, 1], clamp);
  const bundles = interpolate(f, [380, 405], [0, 1], clamp);
  const purkinje = interpolate(f, [405, 440], [0, 1], clamp);
  const wiresOff = interpolate(f, [PHASES.st.from + 20, PHASES.st.from + 50], [1, 0], clamp);

  const avHolding = f >= 185 && f < 362;
  const avPulse = 13 + 5 * Math.sin((f - 185) / 4);

  return (
    <svg viewBox="-230 0 990 660" width={900} height={600} style={{ overflow: "visible" }}>
      <defs>
        <filter id="hglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <clipPath id="atria">
          <path d={RA} />
          <path d={LA} />
        </clipPath>
        <clipPath id="ventricles">
          <path d={RV} />
          <path d={LV} />
        </clipPath>
      </defs>

      <path d={SVC} fill={COLORS.chamber} stroke={COLORS.chamberStroke} strokeWidth={4} />

      <g transform={squeeze(300, 280, atriaScale)}>
        <path d={RA} fill={COLORS.chamber} stroke={COLORS.chamberStroke} strokeWidth={4} />
        <path d={LA} fill={COLORS.chamber} stroke={COLORS.chamberStroke} strokeWidth={4} />
        <g clipPath="url(#atria)">
          <circle cx={SA.x} cy={SA.y} r={atriaSpread} fill={COLORS.active} opacity={atriaOn} filter="url(#soft)" />
        </g>
      </g>

      <g transform={squeeze(300, 292, ventScale)}>
        <path d={RV} fill={COLORS.chamber} stroke={COLORS.chamberStroke} strokeWidth={4} />
        <path d={LV} fill={COLORS.chamber} stroke={COLORS.chamberStroke} strokeWidth={4} />
        <g clipPath="url(#ventricles)">
          <circle cx={300} cy={430} r={ventSpread} fill={COLORS.active} opacity={ventOn} filter="url(#soft)" />
        </g>
      </g>

      {[
        { t: "RA", x: 170, y: 225 },
        { t: "LA", x: 430, y: 225 },
        { t: "RV", x: 185, y: 430 },
        { t: "LV", x: 415, y: 430 },
      ].map((c) => (
        <text
          key={c.t}
          x={c.x}
          y={c.y}
          fill={COLORS.text}
          opacity={0.55}
          fontSize={28}
          fontWeight={700}
          textAnchor="middle"
        >
          {c.t}
        </text>
      ))}

      {/* Conduction system */}
      <g>
        <Wire d={INTERNODAL} p={internodal * interpolate(f, [330, 380], [1, 0], clamp)} />
        <Wire d={BACHMANN} p={internodal * interpolate(f, [330, 380], [1, 0], clamp)} />
        <Wire d={HIS} p={his * wiresOff} />
        <Wire d={RBB} p={bundles * wiresOff} />
        <Wire d={LBB} p={bundles * wiresOff} />
        <Wire d={PURK_R} p={purkinje * wiresOff} />
        <Wire d={PURK_L} p={purkinje * wiresOff} />
      </g>

      {/* SA node */}
      <circle
        cx={SA.x}
        cy={SA.y}
        r={f >= 90 && f < 110 ? 14 + 8 * Math.sin((f - 90) / 3) : 12}
        fill={COLORS.conduction}
        filter="url(#hglow)"
      />
      {/* AV node */}
      <circle cx={AV.x} cy={AV.y} r={avHolding ? avPulse : 11} fill={COLORS.conduction} filter="url(#hglow)" />

      {/* Travelling impulse */}
      {f >= 100 && f < 185 ? <Dot d={INTERNODAL} p={internodal} /> : null}
      {f >= 100 && f < 185 ? <Dot d={BACHMANN} p={internodal} r={10} /> : null}
      {f >= 362 && f < 380 ? <Dot d={HIS} p={his} /> : null}
      {f >= 380 && f < 405 ? (
        <>
          <Dot d={RBB} p={bundles} />
          <Dot d={LBB} p={bundles} />
        </>
      ) : null}
      {f >= 405 && f < 440 ? (
        <>
          <Dot d={PURK_R} p={purkinje} />
          <Dot d={PURK_L} p={purkinje} />
        </>
      ) : null}

      <Label anchor={SA} at={{ x: 60, y: 60 }} text="SA node" side="left" opacity={labelOpacity(f, 95)} />
      <Label anchor={AV} at={{ x: 560, y: 330 }} text="AV node" side="right" opacity={labelOpacity(f, 245)} />
      <Label
        anchor={{ x: 286, y: 400 }}
        at={{ x: 60, y: 400 }}
        text="Bundle branches"
        side="left"
        opacity={labelOpacity(f, 380)}
      />
      <Label
        anchor={{ x: 462, y: 456 }}
        at={{ x: 520, y: 600 }}
        text="Purkinje fibers"
        side="right"
        opacity={labelOpacity(f, 405)}
      />

      {/* Legend */}
      <g opacity={interpolate(f, [90, 110], [0, 1], clamp)}>
        <rect x={60} y={622} width={26} height={26} rx={6} fill={COLORS.active} />
        <text x={100} y={644} fill={COLORS.dim} fontSize={26} fontWeight={600}>
          = electrically active (depolarized)
        </text>
      </g>
    </svg>
  );
};
