import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";

export const isNoteInXBounds = (
  selectedNotes: MidiNote[],
  movementXInSamples: number,
  clip: MidiClip
): boolean => {
  return selectedNotes.every((selectedNote) => {
    const newOn = selectedNote.on + movementXInSamples;
    const newOff = selectedNote.off + movementXInSamples;
    return newOn >= clip.start && newOff <= clip.end;
  });
};
