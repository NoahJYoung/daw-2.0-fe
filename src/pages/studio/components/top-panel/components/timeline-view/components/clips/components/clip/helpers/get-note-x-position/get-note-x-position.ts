import { Timeline, MidiNote } from "@/pages/studio/audio-engine/components";

export const getNoteXPosition = (note: MidiNote, timeline: Timeline) => {
  return timeline.samplesToPixels(note.on);
};
