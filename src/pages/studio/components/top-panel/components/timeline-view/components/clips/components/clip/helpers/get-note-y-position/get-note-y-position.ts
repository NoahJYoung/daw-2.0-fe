import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";

export const getNoteYPosition = (note: MidiNote, noteHeight: number) => {
  const notes = [
    "B",
    "Bb",
    "A",
    "Ab",
    "G",
    "Gb",
    "F",
    "E",
    "Eb",
    "D",
    "Db",
    "C",
  ];
  return notes.indexOf(note.note[0]) * noteHeight;
};
