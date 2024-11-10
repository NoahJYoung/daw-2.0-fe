import { MutableRefObject } from "react";
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { isNoteInYBounds } from "../../../is-note-in-y-bounds.ts";
import { Offsets } from "../../../../../../hooks/use-piano-roll-timeline/types.ts";

export const handleY = (
  e: MouseEvent,
  initialY: MutableRefObject<number>,
  clip: MidiClip,
  offsets: Offsets,
  setOffset: (key: keyof Offsets, value: number) => void
) => {
  const movementY = e.clientY - initialY?.current;
  const threshold = 17.5;

  const { selectedNotes } = clip;

  if (Math.abs(movementY) >= threshold) {
    const direction = movementY > 0 ? 1 : -1;
    const newOffset = offsets.drag + direction;

    if (isNoteInYBounds(selectedNotes, newOffset)) {
      setOffset("drag", newOffset);
      initialY.current = e.clientY;
    }
  }
};
