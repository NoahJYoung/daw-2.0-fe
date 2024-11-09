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
  selectedNotesStartExpandingOffset: number,
  setSelectedNotesStartExpandingOffset: Dispatch<SetStateAction<number>>,
  selectedNotesEndExpandingOffset: number,
  setSelectedNotesEndExpandingOffset: Dispatch<SetStateAction<number>>,
  startExpanding: boolean,
  endExpanding: boolean,
  initialY: MutableRefObject<number>,
  clipStartOffsetPx: number
) => {
  const onMouseMove = (e: MouseEvent) => {
    const expanding = startExpanding || endExpanding;
    if ((!dragging && !expanding) || !selected || !note) {
      return;
    }
    if (startExpanding) {
      if (
        isNoteInXBounds(
          clip.selectedNotes,
          clip.pixelsToSamples(
            e.movementX + selectedNotesStartExpandingOffset + clipStartOffsetPx
          ),
          clip
        )
      ) {
        setSelectedNotesStartExpandingOffset((prev) => prev + e.movementX);
        return;
      }
    }

    if (endExpanding) {
      if (
        isNoteInXBounds(
          clip.selectedNotes,
          clip.pixelsToSamples(
            e.movementX + selectedNotesEndExpandingOffset + clipStartOffsetPx
          ),
          clip
        )
      ) {
        setSelectedNotesEndExpandingOffset((prev) => prev + e.movementX);
        return;
      }
    }

    if (dragging) {
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
    }
  };

  return onMouseMove;
};
