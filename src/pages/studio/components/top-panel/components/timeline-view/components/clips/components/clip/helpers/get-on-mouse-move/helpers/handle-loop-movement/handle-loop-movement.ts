import { Timeline } from "@/pages/studio/audio-engine/components";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { Dispatch, SetStateAction } from "react";

export const handleLoopMovement = (
  movementX: number,
  clip: Clip,
  timeline: Timeline,
  setLoopOffset: Dispatch<SetStateAction<number>>,
  selected: boolean
) => {
  const newValue = clip.loopSamples + timeline.pixelsToSamples(movementX);
  // clip.setLoopSamples(newValue >= 0 ? newValue : 0);
  if (selected) {
    setLoopOffset(newValue);
  }
  return;
};
