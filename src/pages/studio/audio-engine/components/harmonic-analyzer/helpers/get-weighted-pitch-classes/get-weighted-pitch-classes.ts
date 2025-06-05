import type { ProcessedNote, WeightedPitchClass } from "../../types";

export function getWeightedPitchClasses(
  notes: ProcessedNote[]
): WeightedPitchClass[] {
  const pitchWeights = new Map<number, number>();

  for (const note of notes) {
    const pitchClass = note.pitch % 12;
    const weight = (note.duration / 1000) * (note.velocity / 127);
    pitchWeights.set(pitchClass, (pitchWeights.get(pitchClass) || 0) + weight);
  }

  return Array.from(pitchWeights.entries())
    .map(([pitchClass, weight]) => ({ pitchClass, weight }))
    .filter((item) => item.weight > 0);
}
