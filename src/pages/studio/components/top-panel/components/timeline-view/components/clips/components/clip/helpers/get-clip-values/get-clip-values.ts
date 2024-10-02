import { Mixer, Track } from "@/pages/studio/audio-engine/components";

export const getClipValues = (
  selected: boolean,
  dragging: boolean,
  track: Track,
  mixer: Mixer,
  parentTrackIndex: number,
  selectedIndexOffset: number
) => {
  const getTop = () => {
    if (selected && dragging) {
      return (
        mixer.getCombinedLaneHeightsAtIndex(
          parentTrackIndex + selectedIndexOffset
        ) + 2
      );
    }

    return mixer.getCombinedLaneHeightsAtIndex(parentTrackIndex) + 2;
  };

  const getHeight = () => {
    if (selected && dragging) {
      return (
        mixer.tracks[parentTrackIndex + selectedIndexOffset]?.laneHeight - 2
      );
    }
    return track.laneHeight - 2;
  };

  const getColor = () => {
    if (selected && dragging) {
      return mixer.tracks[parentTrackIndex + selectedIndexOffset]?.color;
    }
    return track.color;
  };

  return { top: getTop(), height: getHeight(), color: getColor() };
};
