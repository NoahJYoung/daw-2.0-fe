import { useAudioEngine } from "@/pages/studio/hooks";
import { TOOLBAR_HEIGHT } from "@/pages/studio/utils/constants";
import { observer } from "mobx-react-lite";
import * as Tone from "tone";
import {
  findSmallestSubdivision,
  subdivisionToQuarterMap,
} from "../../helpers/calculate-grid-lines/calculate-grid-lines";
import { useCallback, useMemo } from "react";

export const TopBar = observer(() => {
  const { timeline } = useAudioEngine();
  const { pixels, measures, timeSignature } = timeline;
  const measureWidth = useMemo(() => pixels / measures, [pixels, measures]);

  const smallestSubdivision = useMemo(
    () => findSmallestSubdivision(timeline),
    [timeline, timeline.samplesPerPixel]
  );

  const subdivisionsPerBeat = useMemo(
    () => subdivisionToQuarterMap[smallestSubdivision],
    [smallestSubdivision]
  );

  const subdivisionsPerMeasure = useMemo(
    () => subdivisionsPerBeat * timeSignature,
    [subdivisionsPerBeat, timeSignature]
  );

  const subdivisionWidth = timeline.samplesToPixels(
    Tone.Time(smallestSubdivision).toSamples()
  );

  const generateArray = useCallback(
    (length: number) => Array.from({ length }, (_, i) => i),
    []
  );

  const measuresArray = useMemo(
    () => generateArray(measures),
    [generateArray, measures]
  );

  const subdivisionsArray = useMemo(
    () => generateArray(subdivisionsPerMeasure),
    [generateArray, subdivisionsPerMeasure]
  );

  const beatWidth = useMemo(
    () => timeline.samplesToPixels(Tone.Time("4n").toSamples()),
    [timeline, timeline.samplesPerPixel]
  );

  const getSubdivisionStyle = useCallback(
    (j: number) => {
      if (j === 0) {
        return { height: 66, marginTop: 0 };
      } else if (j % subdivisionsPerBeat === 0) {
        return { height: 54, marginTop: 12 };
      } else {
        return { height: 42, marginTop: 24 };
      }
    },
    [subdivisionsPerBeat]
  );

  const renderEveryFourthMeasure = beatWidth * timeSignature < 40;

  const measuresToRender = useMemo(
    () =>
      measuresArray.map((_, i) => (
        <div
          style={{ width: measureWidth, borderLeftWidth: i === 0 ? 1 : 0 }}
          className="flex-shrink-0 flex rounded-xxs border-surface-2 border relative border-1"
        >
          {subdivisionsArray.map((_, j) => {
            const { height, marginTop } = getSubdivisionStyle(j);
            return (
              <span
                key={j}
                className="border-surface-2"
                style={{
                  width: subdivisionWidth,
                  flexShrink: 0,
                  height,
                  marginTop,
                  borderLeftWidth: j === 0 ? 0 : 1,
                }}
              />
            );
          })}
          <p className="left-1 text-sm text-surface-4 font-bold absolute">
            {i + 1}
          </p>
        </div>
      )),
    [
      getSubdivisionStyle,
      measureWidth,
      measuresArray,
      subdivisionWidth,
      subdivisionsArray,
    ]
  );

  return renderEveryFourthMeasure ? (
    <div
      className="flex sticky top-0 bg-surface-1"
      style={{ width: pixels, height: TOOLBAR_HEIGHT - 4, marginBottom: 5 }}
    >
      {measuresArray.slice(0, measuresArray.length / 4).map((_, i) => (
        <span
          key={i}
          className="border-surface-2 border relative"
          style={{
            width: measureWidth * 4,
            flexShrink: 0,
            height: 69,
            marginTop: 0,
            borderLeftWidth: i === 0 ? 1 : 0,
          }}
        >
          <p className="left-1 text-sm text-surface-4 font-bold absolute">
            {i * 4 + 1}
          </p>
        </span>
      ))}
    </div>
  ) : (
    <div
      className="flex sticky top-0 bg-surface-1"
      style={{ width: pixels, height: TOOLBAR_HEIGHT - 4, marginBottom: 5 }}
    >
      {measuresToRender}
    </div>
  );
});
