import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { UndoManager } from "mobx-keystone";
import { Dispatch, SetStateAction } from "react";
import { StateFlags } from "../../../../hooks/use-piano-roll-timeline/types";

export const getOnTouchStart = (
  initialX: React.MutableRefObject<number>,
  initialY: React.MutableRefObject<number>,
  setStateFlag: (key: keyof StateFlags, value: boolean) => void,
  clip: MidiClip,
  note: MidiNote,
  undoManager: UndoManager,
  setReferenceNote: Dispatch<SetStateAction<MidiNote | null>>
) => {
  const onOnTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setStateFlag("dragging", true);
    setReferenceNote(note);

    initialY.current = e.touches[0].clientY;
    initialX.current = e.touches[0].clientX;

    undoManager.withGroup("UNSELECT ALL AND SELECT ONE", () => {
      if (!e.ctrlKey) {
        clip.unselectAllNotes();
      }
      clip.selectNote(note);
    });
  };
  return onOnTouchStart;
};
