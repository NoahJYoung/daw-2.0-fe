import * as Tone from "tone";
import { ProcessedNote } from "../../types";

export function createPitchClassProfile(notes: ProcessedNote[]): number[] {
  const profile = new Array(12).fill(0);

  for (const note of notes) {
    const durationInSeconds = Tone.Time(note.duration, "samples").toSeconds();
    const pitchClass = note.pitch % 12;
    const weight = durationInSeconds;
    profile[pitchClass] += weight;
  }

  const sum = profile.reduce((a, b) => a + b, 0);
  return sum > 0 ? profile.map((p) => p / sum) : profile;
}
