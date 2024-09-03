import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";

export const Grid = observer(() => {
  const { timeline, mixer } = useAudioEngine();
  const { tracks } = mixer;
  const width = timeline.pixels;
  const className = "stroke-current text-surface-2";

  return (
    <svg width={width} height={mixer.combinedLaneHeights}>
      {tracks.map((track, i) => {
        if (i === 0) {
          return (
            <line
              strokeWidth={1}
              className={className}
              x1={0}
              x2={width}
              y1={track.laneHeight}
              y2={track.laneHeight}
            />
          );
        }
        const y = mixer.getCombinedLaneHeightsAtIndex(i) + track.laneHeight;

        return (
          <line
            strokeWidth={1}
            className={className}
            x1={0}
            x2={width}
            y1={y}
            y2={y}
          />
        );
      })}
    </svg>
  );
});
