import { Clipboard, MidiClip } from "@/pages/studio/audio-engine/components";
import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";
import { UndoManager } from "mobx-keystone";
import * as Tone from "tone";

export const pasteNotes = (
  clipboard: Clipboard,
  clip: MidiClip,
  undoManager: UndoManager
) => {
  const timelinePosition = Tone.Time(
    Tone.getTransport().seconds,
    "s"
  ).toSamples();
  undoManager.withGroup("PASTE NOTES", () => {
    const notes = clipboard.getNotes();
    const firstNoteStart = notes.length > 0 ? notes[0].on : 0;

    notes.forEach((note) => {
      const relativeOffset = note.on - firstNoteStart;

      const newOn = timelinePosition + relativeOffset;
      const newOff = newOn + note.length;

      const newNote = {
        on: newOn - clip.start,
        off: newOff - clip.start,
        velocity: note.velocity,
        note: [...note.note] as PitchNameTuple,
      };

      clip.createEvent(newNote);
    });
  });
};
