import { Mixer, Track } from "@/pages/studio/audio-engine/components";

export const drawLanes = (
  className: string,
  width: number,
  tracks: Track[],
  mixer: Mixer
) => {
  return (
    <>
      <line
        strokeWidth={1}
        className={className}
        x1={0}
        x2={width}
        y1={0}
        y2={0}
      />
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
    </>
  );
};
