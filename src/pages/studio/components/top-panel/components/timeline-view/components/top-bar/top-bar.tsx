import { useAudioEngine } from "@/pages/studio/hooks";
import { TOOLBAR_HEIGHT } from "@/pages/studio/utils/constants";
import { observer } from "mobx-react-lite";
import * as Tone from "tone";
import { gridSubdivisionRatioMap } from "../../helpers/calculate-grid-lines/calculate-grid-lines";

export const TopBar = observer(() => {
  const { timeline } = useAudioEngine();
  const { subdivision, pixels, measures, timeSignature } = timeline;
  const measureWidth = pixels / measures;

  const beatWidth = timeline.samplesToPixels(
    Tone.Time(subdivision).toSamples()
  );

  const subdivisionsPerBeat = gridSubdivisionRatioMap[subdivision];

  const subdivisionsPerMeasure = subdivisionsPerBeat * timeSignature;

  return (
    <div
      className="flex sticky top-0 bg-surface-1"
      style={{ width: pixels, height: TOOLBAR_HEIGHT - 4, marginBottom: 5 }}
    >
      {Array.from({ length: measures }, (_, i) => i).map((_, i) => (
        <div
          style={{ width: measureWidth, borderLeftWidth: i === 0 ? 1 : 0 }}
          className="flex-shrink-0 flex rounded-xxs border-surface-2 border relative border-1"
        >
          {Array.from({ length: subdivisionsPerMeasure }, (_, j) => j).map(
            (_, j) => (
              <span
                key={j}
                className="border-surface-2"
                style={{
                  width: beatWidth,
                  flexShrink: 0,
                  height: j === 0 ? 72 : 48,
                  marginTop: j === 0 ? 0 : 19,
                  borderLeftWidth: j === 0 ? 0 : 1,
                }}
              />
            )
          )}
          <p className="left-1 text-sm text-surface-4 font-bold absolute">
            {i + 1}
          </p>
        </div>
      ))}
    </div>
  );
});
