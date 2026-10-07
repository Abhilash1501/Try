import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionCard } from "./CaptionCard";
import { EcgTrace } from "./EcgTrace";
import { fontFamily } from "./fonts";
import { Heart } from "./Heart";
import { COLORS, PHASES, clamp } from "./timeline";


export const ECGExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panels = interpolate(frame, [55, 85], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily }}>
      {/* Intro title */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: interpolate(frame, [0, 15, 60, 80], [0, 1, 1, 0], clamp),
          translate: interpolate(frame, [0, 20], ["0px 40px", "0px 0px"], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div style={{ color: COLORS.qrs, fontSize: 34, fontWeight: 800, letterSpacing: 6 }}>HOW TO READ AN ECG</div>
        <div style={{ color: COLORS.text, fontSize: 130, fontWeight: 800, marginTop: 10 }}>One heartbeat,</div>
        <div style={{ color: COLORS.text, fontSize: 130, fontWeight: 800, lineHeight: 1 }}>wave by wave</div>
      </AbsoluteFill>

      {/* Persistent heart + ECG layout */}
      <div style={{ position: "absolute", left: 30, top: 230, opacity: panels }}>
        <Heart />
      </div>
      <div style={{ position: "absolute", left: 960, top: 110, opacity: panels }}>
        <EcgTrace />
      </div>

      <Sequence name="P wave" from={PHASES.p.from} durationInFrames={PHASES.p.dur} premountFor={fps}>
        <CaptionCard
          dur={PHASES.p.dur}
          accent={COLORS.p}
          kicker="Atrial depolarization"
          title="P wave"
          body="The SA node fires. An electrical wave spreads across both atria."
          note="The atria contract just after this wave."
        />
      </Sequence>
      <Sequence name="PR segment" from={PHASES.pr.from} durationInFrames={PHASES.pr.dur} premountFor={fps}>
        <CaptionCard
          dur={PHASES.pr.dur}
          accent={COLORS.pr}
          kicker="AV node delay"
          title="PR segment"
          body="The AV node holds the signal for ~0.1 s while the atria squeeze blood into the ventricles."
        />
      </Sequence>
      <Sequence name="QRS complex" from={PHASES.qrs.from} durationInFrames={PHASES.qrs.dur} premountFor={fps}>
        <CaptionCard
          dur={PHASES.qrs.dur}
          accent={COLORS.qrs}
          kicker="Ventricular depolarization"
          title="QRS complex"
          body="The impulse races down the bundle branches and Purkinje fibers. The ventricles contract."
          note="Atrial repolarization is hidden inside the QRS."
        />
      </Sequence>
      <Sequence name="ST segment" from={PHASES.st.from} durationInFrames={PHASES.st.dur} premountFor={fps}>
        <CaptionCard
          dur={PHASES.st.dur}
          accent={COLORS.st}
          kicker="Ventricles fully depolarized"
          title="ST segment"
          body="All ventricular cells are active at once, so the line is flat while blood is pumped out."
        />
      </Sequence>
      <Sequence name="T wave" from={PHASES.t.from} durationInFrames={PHASES.t.dur} premountFor={fps}>
        <CaptionCard
          dur={PHASES.t.dur}
          accent={COLORS.t}
          kicker="Ventricular repolarization"
          title="T wave"
          body="The ventricles electrically reset and relax, ready for the next beat."
        />
      </Sequence>
      <Sequence name="Recap" from={PHASES.recap.from} durationInFrames={PHASES.recap.dur} premountFor={fps}>
        <CaptionCard
          dur={PHASES.recap.dur + 10}
          accent={COLORS.text}
          kicker="Recap"
          title="Then it repeats"
          body="The SA node fires again, about 60–100 times a minute at rest."
        />
      </Sequence>
    </AbsoluteFill>
  );
};
