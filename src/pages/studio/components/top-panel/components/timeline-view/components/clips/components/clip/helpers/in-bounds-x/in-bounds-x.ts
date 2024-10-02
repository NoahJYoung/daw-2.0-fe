import { Clip } from "@/pages/studio/audio-engine/components/types";

export const inBoundsX = (
  selectedClips: Clip[],
  movementXInSamples: number
): boolean => {
  return selectedClips.every((selectedClip) => {
    const newStart = selectedClip.start + movementXInSamples;
    return newStart >= 0;
  });
};
