import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import * as Tone from "tone";

export const isNoteInXBounds = (
  selectedNotes: MidiNote[],
  movementXInSamples: number,
  clip: MidiClip
): boolean => {
  return selectedNotes.every((selectedNote) => {
    const newOn = selectedNote.on + movementXInSamples;
    const newOff = selectedNote.off + movementXInSamples;
    const offsetSamples =
      clip.start - Tone.Time(clip.startMeasure, "m").toSamples();

    return newOn - offsetSamples >= 0 && newOff - offsetSamples <= clip.length;
  });
};
