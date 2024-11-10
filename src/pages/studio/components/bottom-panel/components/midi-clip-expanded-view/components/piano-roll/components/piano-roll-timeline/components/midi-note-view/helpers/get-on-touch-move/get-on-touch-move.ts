import { MidiClip } from "@/pages/studio/audio-engine/components";
import { isNoteInXBounds } from "../is-note-in-x-bounds";
import { MutableRefObject } from "react";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { handleY } from "../get-on-mouse-move/helpers";
import {
  Offsets,
  StateFlags,
} from "../../../../hooks/use-piano-roll-timeline/types";

export const getOnTouchMove = (
  offsets: Offsets,
  setOffset: (
    key: keyof Offsets,
    value: number | ((x: number) => number)
  ) => void,
  state: StateFlags,
  selected: boolean,
  note: MidiNote | null,
  clip: MidiClip,
  initialX: MutableRefObject<number>,
  initialY: MutableRefObject<number>,
  clipStartOffsetPx: number
) => {
  const onTouchMove = (e: TouchEvent) => {
    const { dragging, startExpanding, endExpanding } = state;

    const expanding = startExpanding || endExpanding;
    if ((!dragging && !expanding) || !selected || !note) return;
    e.stopPropagation();

    const touch = e.touches[0];
    const movementX = touch.clientX - (initialX.current || touch.clientX);

    if (startExpanding) {
      if (
        isNoteInXBounds(
          clip.selectedNotes,
          clip.pixelsToSamples(
            movementX + offsets.startExpanding + clipStartOffsetPx
          ),
          clip
        )
      ) {
        setOffset("startExpanding", (prev) => prev + movementX);
        initialX.current = touch.clientX;
        return;
      }
    }

    if (endExpanding) {
      if (
        isNoteInXBounds(
          clip.selectedNotes,
          clip.pixelsToSamples(
            movementX + offsets.endExpanding + clipStartOffsetPx
          ),
          clip
        )
      ) {
        setOffset("endExpanding", (prev) => prev + movementX);
        initialX.current = touch.clientX;
        return;
      }
    }

    if (dragging) {
      if (
        isNoteInXBounds(
          clip.selectedNotes,
          clip.pixelsToSamples(
            movementX + offsets.position + clipStartOffsetPx
          ),
          clip
        )
      ) {
        setOffset("position", (prev) => prev + movementX);
      }

      initialX.current = touch.clientX;

      return handleY(
        {
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as MouseEvent,
        initialY,
        clip,
        offsets,
        setOffset
      );
    }
  };

  return onTouchMove;
};
