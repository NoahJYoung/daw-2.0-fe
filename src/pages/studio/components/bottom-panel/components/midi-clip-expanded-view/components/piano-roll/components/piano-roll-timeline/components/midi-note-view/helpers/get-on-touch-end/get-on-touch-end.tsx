import * as Tone from "tone";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { setNoteFromIndex } from "../get-on-mouse-up/helpers";
import {
  Offsets,
  StateFlags,
} from "../../../../hooks/use-piano-roll-timeline/types";

export const getOnTouchEnd = (
  offsets: Offsets,
  setOffset: (key: keyof Offsets, value: number) => void,
  state: StateFlags,
  setStateFlag: (key: keyof StateFlags, value: boolean) => void,
  note: MidiNote | null,
  clip: MidiClip,
  undoManager: UndoManager,
  setReferenceNote: Dispatch<SetStateAction<MidiNote | null>>,
  initialX: MutableRefObject<number>,
  initialY: MutableRefObject<number>
) => {
  const resetStates = () => {
    setReferenceNote(null);
    setStateFlag("dragging", false);
    setStateFlag("startExpanding", false);
    setStateFlag("endExpanding", false);
    setOffset("startExpanding", 0);
    setOffset("endExpanding", 0);
    setOffset("drag", 0);
    setOffset("position", 0);
    initialY.current = 0;
    initialX.current = 0;
  };

  const { startExpanding, endExpanding, dragging } = state;

  const expanding = startExpanding || endExpanding;

  const onTouchEnd = (e: TouchEvent) => {
    if ((!dragging && !expanding) || !note) {
      resetStates();
      return;
    }
    e.stopPropagation();

    // Expand from start
    if (startExpanding) {
      const initialStartDifference = clip.pixelsToSamples(
        offsets.startExpanding
      );
      const firstNoteExpandedStart = note.on + initialStartDifference;
      const quantizedFirstNoteExpandedStart = Tone.Time(
        Tone.Time(firstNoteExpandedStart, "samples").quantize(clip.subdivision),
        "s"
      ).toSamples();
      undoManager.withGroup("HANDLE NOTE START EXPANDING", () => {
        const quantizeExpandingStartOffset = clip.snapToGrid
          ? quantizedFirstNoteExpandedStart - firstNoteExpandedStart
          : 0;
        clip.selectedNotes.forEach((selectedNote) => {
          const timeOffset = clip.pixelsToSamples(offsets.startExpanding);
          const newOn =
            selectedNote.on + timeOffset + quantizeExpandingStartOffset;

          undoManager.withGroup("SET NOTE ON", () => {
            selectedNote.setOn(newOn);
          });
        });

        return resetStates();
      });
    }

    // Expand from end
    if (endExpanding) {
      const initialEndDifference = clip.pixelsToSamples(offsets.endExpanding);
      const firstNoteExpandedEnd = note.off + initialEndDifference;
      const quantizedFirstNoteExpandedEnd = Tone.Time(
        Tone.Time(firstNoteExpandedEnd, "samples").quantize(clip.subdivision),
        "s"
      ).toSamples();
      undoManager.withGroup("HANDLE NOTE END EXPANDING", () => {
        const quantizeExpandingEndOffset = clip.snapToGrid
          ? quantizedFirstNoteExpandedEnd - firstNoteExpandedEnd
          : 0;
        clip.selectedNotes.forEach((selectedNote) => {
          const timeOffset = clip.pixelsToSamples(offsets.endExpanding);
          const newOff =
            selectedNote.off + timeOffset + quantizeExpandingEndOffset;

          undoManager.withGroup("SET NOTE OFF", () => {
            selectedNote.setOff(newOff);
          });
        });

        return resetStates();
      });
    }

    // X Movement
    const initialTimeDifference = clip.pixelsToSamples(offsets.position);
    const firstNoteStart = note.on + initialTimeDifference;
    const quantizedFirstNoteStart = Tone.Time(
      Tone.Time(firstNoteStart, "samples").quantize(clip.subdivision),
      "s"
    ).toSamples();
    undoManager.withGroup("HANDLE NOTE MOVEMENT", () => {
      const quantizeOffset = clip.snapToGrid
        ? quantizedFirstNoteStart - firstNoteStart
        : 0;
      clip.selectedNotes.forEach((selectedNote) => {
        const timeOffset = clip.pixelsToSamples(offsets.position);
        const newOn = selectedNote.on + timeOffset + quantizeOffset;
        const newOff = selectedNote.off + timeOffset + quantizeOffset;

        undoManager.withGroup("SET NOTE ON AND OFF", () => {
          selectedNote.setOn(newOn);
          selectedNote.setOff(newOff);
        });
      });
      // Y Movement
      if (offsets.drag !== 0) {
        undoManager.withGroup("MOVE NOTES TO NEW LANE", () => {
          clip.selectedNotes.forEach((selectedNote) => {
            setNoteFromIndex(selectedNote, offsets.drag);
          });
        });
      }
      resetStates();
    });
  };
  return onTouchEnd;
};
