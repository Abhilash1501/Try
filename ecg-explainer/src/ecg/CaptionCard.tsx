import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, clamp } from "./timeline";

export const CaptionCard: React.FC<{
  dur: number;
  accent: string;
  kicker: string;
  title: string;
  body: string;
  note?: string;
}> = ({ dur, accent, kicker, title, body, note }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, 12, dur - 10, dur], [0, 1, 1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 960,
        top: 600,
        width: 880,
        height: 400,
        boxSizing: "border-box",
        padding: "30px 40px",
        borderRadius: 18,
        backgroundColor: COLORS.panel,
        borderLeft: `10px solid ${accent}`,
        opacity,
        translate: interpolate(f, [0, 18], ["0px 30px", "0px 0px"], {
          ...clamp,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <div style={{ color: accent, fontSize: 28, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
        {kicker}
      </div>
      <div style={{ color: COLORS.text, fontSize: 84, fontWeight: 800, lineHeight: 1.1, marginTop: 6 }}>{title}</div>
      <div style={{ color: COLORS.text, fontSize: 38, lineHeight: 1.3, marginTop: 14 }}>{body}</div>
      {note ? (
        <div style={{ color: COLORS.dim, fontSize: 27, fontStyle: "italic", marginTop: 14 }}>{note}</div>
      ) : null}
    </div>
  );
};
