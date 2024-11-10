import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { UndoManager } from "mobx-keystone";
import { Dispatch, SetStateAction } from "react";

export const getOnMouseDown = (
  initialX: React.MutableRefObject<number>,
  initialY: React.MutableRefObject<number>,
  setDragging: React.Dispatch<SetStateAction<boolean>>,
  clip: MidiClip,
  note: MidiNote,
  undoManager: UndoManager,
  setReferenceNote: Dispatch<SetStateAction<MidiNote | null>>
) => {
  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 2) {
      setDragging(true);
    }
    setReferenceNote(note);

    initialY.current = e.clientY;
    initialX.current = e.clientX;

    if (e.button !== 2) {
      undoManager.withGroup("UNSELECT ALL AND SELECT ONE", () => {
        if (!e.ctrlKey) {
          clip.unselectAllNotes();
        }

        clip.selectNote(note);
      });
    }
  };
  return onMouseDown;
};
