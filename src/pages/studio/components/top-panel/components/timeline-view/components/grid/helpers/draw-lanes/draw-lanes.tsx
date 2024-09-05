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
        const y =
          i === 0
            ? track.laneHeight
            : mixer.getCombinedLaneHeightsAtIndex(i) + track.laneHeight;

        return (
          <line
            key={track.id}
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
