import { useAudioEngine } from "@/pages/studio/hooks";
import { TOOLBAR_HEIGHT } from "@/pages/studio/utils/constants";
import { memo, useCallback, useMemo } from "react";

interface TopBarProps {
  subdivisionsPerBeat: number;
  subdivisionWidth: number;
  measureWidth: number;
  measuresArray: number[];
  subdivisionsArray: number[];
  renderEveryFourthMeasure: boolean;
}

export const TopBar = memo(
  ({
    subdivisionsPerBeat,
    subdivisionWidth,
    measureWidth,
    measuresArray,
    subdivisionsArray,
    renderEveryFourthMeasure,
  }: TopBarProps) => {
    const { timeline } = useAudioEngine();
    const { pixels } = timeline;

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

    const measuresToRender = useMemo(
      () =>
        measuresArray.map((_, i) => (
          <div
            key={i}
            style={{
              zIndex: 10,
              width: measureWidth,
              borderLeftWidth: i === 0 ? 1 : 0,
            }}
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
                    zIndex: 10,
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
        className="flex sticky top-0 bg-surface-1 select-none"
        style={{
          zIndex: 10,
          width: pixels,
          height: TOOLBAR_HEIGHT,
          marginBottom: 3,
          paddingTop: 2,
        }}
      >
        {measuresArray.slice(0, measuresArray.length / 4).map((_, i) => (
          <span
            key={i}
            id={`measure-${i}`}
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
        className="flex sticky top-0 bg-surface-1 select-none"
        style={{
          zIndex: 10,
          width: pixels,
          height: TOOLBAR_HEIGHT - 4,
          marginBottom: 5,
        }}
      >
        {measuresToRender}
      </div>
    );
  }
);
