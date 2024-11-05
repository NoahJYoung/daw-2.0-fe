import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { getKeys } from "../../../../../../helpers";

const notes = getKeys().map((pitchTuple) => pitchTuple.join("-"));

export const inBoundsY = (selectedNotes: MidiNote[], offset: number) => {
  return selectedNotes.every((selectedNote) => {
    const noteIndex = notes.indexOf(selectedNote.note.join("-"));
    const newIndex = noteIndex + offset;
    return noteIndex !== -1 && newIndex >= 0 && newIndex <= notes.length - 1;
  });
};
