import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { inBoundsY } from "../../../in-bounds-y";
import { MidiClip } from "@/pages/studio/audio-engine/components";

export const handleY = (
  e: MouseEvent,
  initialY: MutableRefObject<number>,
  clip: MidiClip,
  selectedNotesDragOffset: number,
  setSelectedNotesDragOffset: Dispatch<SetStateAction<number>>
) => {
  const movementY = e.clientY - initialY?.current;
  const threshold = 17.5;

  const { selectedNotes } = clip;

  if (Math.abs(movementY) >= threshold) {
    const direction = movementY > 0 ? 1 : -1;
    const newOffset = selectedNotesDragOffset + direction;

    if (inBoundsY(selectedNotes, newOffset)) {
      setSelectedNotesDragOffset(newOffset);
      initialY.current = e.clientY;
    }
  }
};
