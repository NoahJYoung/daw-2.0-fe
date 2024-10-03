import { Timeline } from "@/pages/studio/audio-engine/components";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { Dispatch, SetStateAction } from "react";

export const handleLoopMovement = (
  movementX: number,
  clip: Clip,
  timeline: Timeline,
  setLoopOffset: Dispatch<SetStateAction<number>>,
  loopOffset: number,
  selected: boolean
) => {
  if (selected) {
    const newValue = loopOffset + timeline.pixelsToSamples(movementX);

    if (clip.loopSamples + loopOffset >= 0) {
      setLoopOffset(Math.abs(newValue) >= 0 ? newValue : 0);
    }
  }
  return;
};
