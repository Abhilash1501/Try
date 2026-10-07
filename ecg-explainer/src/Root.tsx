import { Composition } from "remotion";
import { ECGExplainer } from "./ecg/ECGExplainer";
import { FPS, TOTAL_FRAMES } from "./ecg/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ECGExplainer"
      component={ECGExplainer}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
