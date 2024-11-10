import { MidiClip } from "@/pages/studio/audio-engine/components";
import { isNoteInXBounds } from "../is-note-in-x-bounds";
import { MutableRefObject } from "react";
import { handleY } from "./helpers/handle-y";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import {
  Offsets,
  StateFlags,
} from "../../../../hooks/use-piano-roll-timeline/types";

export const getOnMouseMove = (
  offsets: Offsets,
  setOffset: (
    key: keyof Offsets,
    value: number | ((x: number) => number)
  ) => void,
  state: StateFlags,
  selected: boolean,
  note: MidiNote | null,
  clip: MidiClip,
  initialY: MutableRefObject<number>,
  clipStartOffsetPx: number
) => {
  const onMouseMove = (e: MouseEvent) => {
    const { dragging, startExpanding, endExpanding } = state;

    const expanding = startExpanding || endExpanding;
    if ((!dragging && !expanding) || !selected || !note) {
      return;
    }
    if (startExpanding) {
      if (
        isNoteInXBounds(
          clip.selectedNotes,
          clip.pixelsToSamples(
            e.movementX + offsets.startExpanding + clipStartOffsetPx
          ),
          clip
        )
      ) {
        setOffset("startExpanding", (prev) => prev + e.movementX);
        return;
      }
    }

    if (endExpanding) {
      if (
        isNoteInXBounds(
          clip.selectedNotes,
          clip.pixelsToSamples(
            e.movementX + offsets.endExpanding + clipStartOffsetPx
          ),
          clip
        )
      ) {
        setOffset("endExpanding", (prev) => prev + e.movementX);
        return;
      }
    }

    if (dragging) {
      if (
        isNoteInXBounds(
          clip.selectedNotes,
          clip.pixelsToSamples(
            e.movementX + offsets.position + clipStartOffsetPx
          ),
          clip
        )
      ) {
        setOffset("position", (prev) => prev + e.movementX);
      }

      return handleY(e, initialY, clip, offsets, setOffset);
    }
  };

  return onMouseMove;
};
