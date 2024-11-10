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
  startExpanding: boolean,
  setStartExpanding: Dispatch<SetStateAction<boolean>>,
  endExpanding: boolean,
  setEndExpanding: Dispatch<SetStateAction<boolean>>,
  selectedNotesStartExpandingOffset: number,
  setSelectedNotesStartExpandingOffset: Dispatch<SetStateAction<number>>,
  selectedNotesEndExpandingOffset: number,
  setSelectedNotesEndExpandingOffset: Dispatch<SetStateAction<number>>,
  note: MidiNote | null,
  clip: MidiClip,
  undoManager: UndoManager,
  setReferenceNote: Dispatch<SetStateAction<MidiNote | null>>,
  initialX: MutableRefObject<number>,
  initialY: MutableRefObject<number>
) => {
  const resetStates = () => {
    setReferenceNote(null);
    setDragging(false);
    setStartExpanding(false);
    setEndExpanding(false);
    setSelectedNotesStartExpandingOffset(0);
    setSelectedNotesEndExpandingOffset(0);
    setSelectedNotesDragOffset(0);
    setSelectedNotesPositionOffset(0);
    initialY.current = 0;
    initialX.current = 0;
  };
  if (!note) {
    return;
  }

  const expanding = startExpanding || endExpanding;

  const onMouseUp = (e: MouseEvent) => {
    if (!dragging && !expanding) {
      resetStates();
      return;
    }
    e.stopPropagation();

    //Expand from start
    if (startExpanding) {
      const initialStartDifference = clip.pixelsToSamples(
        selectedNotesStartExpandingOffset
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
          const timeOffset = clip.pixelsToSamples(
            selectedNotesStartExpandingOffset
          );
          const newOn =
            selectedNote.on + timeOffset + quantizeExpandingStartOffset;

          undoManager.withGroup("SET NOTE ON", () => {
            selectedNote.setOn(newOn);
          });
        });

        resetStates();
      });
    }

    //Expand from end
    if (endExpanding) {
      const initialEndDifference = clip.pixelsToSamples(
        selectedNotesEndExpandingOffset
      );
      const firstNoteExpandedEnd = note.off + initialEndDifference;
      const quantizedFirstNoteExpandedEnd = Tone.Time(
        Tone.Time(firstNoteExpandedEnd, "samples").quantize(clip.subdivision),
        "s"
      ).toSamples();
      undoManager.withGroup("HANDLE NOTE START EXPANDING", () => {
        const quantizeExpandingEndOffset = clip.snapToGrid
          ? quantizedFirstNoteExpandedEnd - firstNoteExpandedEnd
          : 0;
        clip.selectedNotes.forEach((selectedNote) => {
          const timeOffset = clip.pixelsToSamples(
            selectedNotesEndExpandingOffset
          );
          const newOff =
            selectedNote.off + timeOffset + quantizeExpandingEndOffset;

          undoManager.withGroup("SET NOTE ON", () => {
            selectedNote.setOff(newOff);
          });
        });

        resetStates();
      });
    }

    // X Movement
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
      // Y Movement
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
