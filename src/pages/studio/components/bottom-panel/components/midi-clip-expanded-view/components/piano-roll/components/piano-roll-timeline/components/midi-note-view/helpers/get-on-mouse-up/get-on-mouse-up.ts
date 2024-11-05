import * as Tone from "tone";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { setNoteFromIndex } from "./helpers";

export const getOnMouseUp = (
  dragging: boolean,
  setDragging: Dispatch<SetStateAction<boolean>>,
  selectedNotesPositionOffset: number,
  setSelectedNotesPositionOffset: Dispatch<SetStateAction<number>>,
  selectedNotesDragOffset: number,
  setSelectedNotesDragOffset: Dispatch<SetStateAction<number>>,
  note: MidiNote,
  clip: MidiClip,
  undoManager: UndoManager,
  initialX: MutableRefObject<number>,
  initialY: MutableRefObject<number>
) => {
  const resetStates = () => {
    setDragging(false);
    setSelectedNotesDragOffset(0);
    setSelectedNotesPositionOffset(0);
    initialY.current = 0;
    initialX.current = 0;
  };
  const onMouseUp = (e: MouseEvent) => {
    if (!dragging) {
      resetStates();
      return;
    }
    e.stopPropagation();

    const initialTimeDifference = clip.pixelsToSamples(
      selectedNotesPositionOffset
    );
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
        const timeOffset = clip.pixelsToSamples(selectedNotesPositionOffset);
        const newOn = selectedNote.on + timeOffset + quantizeOffset;
        const newOff = selectedNote.off + timeOffset + quantizeOffset;

        undoManager.withGroup("SET NOTE ON AND OFF", () => {
          selectedNote.setOn(newOn);
          selectedNote.setOff(newOff);
        });
      });
      if (selectedNotesDragOffset !== 0) {
        undoManager.withGroup("MOVE NOTES TO NEW LANE", () => {
          clip.selectedNotes.forEach((selectedNote) => {
            setNoteFromIndex(selectedNote, selectedNotesDragOffset);
          });
        });
      }
      resetStates();
    });
  };
  return onMouseUp;
};
