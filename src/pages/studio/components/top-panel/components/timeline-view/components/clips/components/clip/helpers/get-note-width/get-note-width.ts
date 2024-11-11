import { Timeline } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";

export const getNoteWidth = (note: MidiNote, timeline: Timeline) => {
  return timeline.samplesToPixels(note.length);
};
