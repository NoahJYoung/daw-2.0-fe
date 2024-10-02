import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { inBoundsY } from "../../../in-bounds-y";
import { Mixer, Track } from "@/pages/studio/audio-engine/components";

export const handleYMovement = (
  e: MouseEvent,
  initialY: MutableRefObject<number>,
  track: Track,
  mixer: Mixer,
  selectedIndexOffset: number,
  setSelectedIndexOffset: Dispatch<SetStateAction<number>>
) => {
  const movementY = e.clientY - initialY?.current;
  const threshold = track.laneHeight * 0.75;

  if (Math.abs(movementY) < 20) {
    return;
  }

  const clampedThreshold = Math.max(80, Math.min(140, threshold));

  const { selectedClips, tracks } = mixer;

  if (Math.abs(movementY) >= clampedThreshold) {
    const direction = movementY > 0 ? 1 : -1;
    const newOffset = selectedIndexOffset + direction;

    if (inBoundsY(tracks, selectedClips, newOffset)) {
      setSelectedIndexOffset(newOffset);
      initialY.current = e.clientY;
    }
  }
};
