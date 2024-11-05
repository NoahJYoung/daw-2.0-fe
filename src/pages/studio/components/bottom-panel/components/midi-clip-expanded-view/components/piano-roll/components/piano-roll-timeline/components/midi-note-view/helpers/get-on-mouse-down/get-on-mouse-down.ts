import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { UndoManager } from "mobx-keystone";
import { SetStateAction } from "react";

export const getOnMouseDown = (
  initialX: React.MutableRefObject<number>,
  initialY: React.MutableRefObject<number>,
  setDragging: React.Dispatch<SetStateAction<boolean>>,
  clip: MidiClip,
  note: MidiNote,
  undoManager: UndoManager
) => {
  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 2) {
      setDragging(true);
    }

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
