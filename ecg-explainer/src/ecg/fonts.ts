import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Inter (SIL OFL 1.1), bundled locally from @fontsource/inter.
export const fontFamily = "Inter";

const faces: { weight: string; style: "normal" | "italic" }[] = [
  { weight: "400", style: "normal" },
  { weight: "600", style: "normal" },
  { weight: "700", style: "normal" },
  { weight: "800", style: "normal" },
  { weight: "400", style: "italic" },
];

for (const { weight, style } of faces) {
  loadFont({
    family: fontFamily,
    url: staticFile(`fonts/inter-latin-${weight}-${style}.woff2`),
    weight,
    style,
  });
}
