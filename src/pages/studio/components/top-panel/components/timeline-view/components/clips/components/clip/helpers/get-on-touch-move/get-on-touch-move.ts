import { Mixer, Timeline, Track } from "@/pages/studio/audio-engine/components";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { inBoundsX } from "../in-bounds-x";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { handleLoopMovement } from "../get-on-mouse-move/helpers";
import { handleYMovement } from "../get-on-mouse-move/helpers/handle-y-movement";

export const getOnTouchMove = (
  dragging: boolean,
  selected: boolean,
  isLooping: boolean,
  clip: Clip | null,
  track: Track | null,
  timeline: Timeline,
  mixer: Mixer,
  selectedOffset: number,
  setSelectedOffset: Dispatch<SetStateAction<number>>,
  selectedIndexOffset: number,
  setSelectedIndexOffset: Dispatch<SetStateAction<number>>,
  initialX: MutableRefObject<number>,

  initialY: MutableRefObject<number>,
  setLoopOffset: Dispatch<SetStateAction<number>>,
  loopOffset: number
) => {
  const onTouchMove = (e: TouchEvent) => {
    if (!dragging || !selected || !clip) return;
    e.stopPropagation();
    e.preventDefault();

    const touch = e.touches[0];
    const movementX = touch.clientX - (initialX.current || touch.clientX);

    if (isLooping) {
      handleLoopMovement(
        movementX,
        clip,
        timeline,
        setLoopOffset,
        loopOffset,
        selected
      );
      initialX.current = touch.clientX;
      return;
    }

    if (
      inBoundsX(
        mixer.selectedClips,
        timeline.pixelsToSamples(movementX + selectedOffset)
      )
    ) {
      setSelectedOffset((prev) => prev + movementX);
    }

    initialX.current = touch.clientX;

    if (track) {
      return handleYMovement(
        {
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as MouseEvent,
        initialY,
        track,
        mixer,
        selectedIndexOffset,
        setSelectedIndexOffset
      );
    }
  };

  return onTouchMove;
};
