import { MidiClip } from "@/pages/studio/audio-engine/components";
import { isNoteInXBounds } from "../is-note-in-x-bounds";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { handleY } from "./helpers/handle-y";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";

export const getOnMouseMove = (
  dragging: boolean,
  selected: boolean,
  note: MidiNote | null,

  clip: MidiClip,
  selectedNotesPositionOffset: number,
  setSelectedNotesPositionOffset: Dispatch<SetStateAction<number>>,
  selectedNotesDragOffset: number,
  setSelectedNotesDragOffset: Dispatch<SetStateAction<number>>,
  initialY: MutableRefObject<number>,
  clipStartOffsetPx: number
) => {
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging || !selected || !note) {
      return;
    }

    if (
      isNoteInXBounds(
        clip.selectedNotes,
        clip.pixelsToSamples(
          e.movementX + selectedNotesPositionOffset + clipStartOffsetPx
        ),
        clip
      )
    ) {
      setSelectedNotesPositionOffset((prev) => prev + e.movementX);
    }

    return handleY(
      e,
      initialY,
      clip,
      selectedNotesDragOffset,
      setSelectedNotesDragOffset
    );
  };

  return onMouseMove;
};
