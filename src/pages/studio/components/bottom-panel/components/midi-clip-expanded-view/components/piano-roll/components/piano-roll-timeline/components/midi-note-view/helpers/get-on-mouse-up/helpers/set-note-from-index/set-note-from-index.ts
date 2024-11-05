import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { getKeys } from "../../../../../../../../helpers";
import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";

export const setNoteFromIndex = (note: MidiNote, indexOffset: number) => {
  const notes = getKeys().map((pitchTuple) => pitchTuple.join("-"));
  const initialNoteIndex = notes.indexOf(note.note.join("-"));
  if (initialNoteIndex !== -1) {
    const newNoteIndex = initialNoteIndex + indexOffset;
    const [noteName, octaveString] = notes[newNoteIndex].split("-");
    const newPitchTuple = [noteName, parseInt(octaveString)] as PitchNameTuple;
    note.setNote(newPitchTuple);
  } else {
    throw new Error("Midi note index not found");
  }
};
