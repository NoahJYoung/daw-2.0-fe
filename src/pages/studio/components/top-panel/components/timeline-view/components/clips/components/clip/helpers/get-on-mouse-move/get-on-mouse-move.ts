import { Mixer, Timeline, Track } from "@/pages/studio/audio-engine/components";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { inBoundsX } from "../in-bounds-x";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { handleLoopMovement } from "./helpers";
import { handleYMovement } from "./helpers/handle-y-movement";

export const getOnMouseMove = (
  dragging: boolean,
  selected: boolean,
  isLooping: boolean,
  clip: Clip | null,
  track: Track,
  timeline: Timeline,
  mixer: Mixer,
  selectedOffset: number,
  setSelectedOffset: Dispatch<SetStateAction<number>>,
  selectedIndexOffset: number,
  setSelectedIndexOffset: Dispatch<SetStateAction<number>>,
  initialY: MutableRefObject<number>,
  setLoopOffset: Dispatch<SetStateAction<number>>
) => {
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging || !selected || !clip) return;

    if (isLooping) {
      return handleLoopMovement(
        e.movementX,
        clip,
        timeline,
        setLoopOffset,
        selected
      );
    }

    if (
      inBoundsX(
        mixer.selectedClips,
        timeline.pixelsToSamples(e.movementX + selectedOffset)
      )
    ) {
      setSelectedOffset((prev) => prev + e.movementX);
    }

    return handleYMovement(
      e,
      initialY,
      track,
      mixer,
      selectedIndexOffset,
      setSelectedIndexOffset
    );
  };

  return onMouseMove;
};
