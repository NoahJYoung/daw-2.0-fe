import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { UndoManager } from "mobx-keystone";
import { Dispatch, SetStateAction } from "react";
import { StateFlags } from "../../../../hooks/use-piano-roll-timeline/types";

export const getOnMouseDown = (
  initialX: React.MutableRefObject<number>,
  initialY: React.MutableRefObject<number>,
  setStateFlag: (key: keyof StateFlags, value: boolean) => void,

  clip: MidiClip,
  note: MidiNote,
  undoManager: UndoManager,
  setReferenceNote: Dispatch<SetStateAction<MidiNote | null>>
) => {
  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 2) {
      setStateFlag("dragging", true);
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
