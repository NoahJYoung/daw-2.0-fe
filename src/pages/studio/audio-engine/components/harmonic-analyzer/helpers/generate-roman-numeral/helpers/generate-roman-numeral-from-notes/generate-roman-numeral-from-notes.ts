import * as Tonal from "tonal";
import type { KeyAnalysisResult } from "../../../../types";

export function generateRomanNumeralFromNotes(
  noteNames: string[],
  keyResult: KeyAnalysisResult,
  quality?: string
): string {
  const minorQualities = ["Minor", "Diminished"];
  if (noteNames.length === 0) return "?";

  const bassNote = noteNames[0];
  const keyScale =
    keyResult.mode === "major"
      ? Tonal.Scale.get(`${keyResult.key} major`).notes
      : Tonal.Scale.get(`${keyResult.key} minor`).notes;

  const rootIndex = keyScale.findIndex(
    (note) => Tonal.Note.chroma(note) === Tonal.Note.chroma(bassNote)
  );

  if (rootIndex >= 0) {
    const degree = rootIndex + 1;
    const hasMinorThird = noteNames.some((note) => {
      const interval = Tonal.Interval.distance(bassNote, note);
      return Tonal.Interval.semitones(interval) === 3;
    });

    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
    const base = romanNumerals[degree - 1];

    const lowerCase =
      hasMinorThird || (!!quality && minorQualities.includes(quality))
        ? true
        : false;

    return lowerCase ? base.toLowerCase() : base;
  }

  return noteNames.join("/");
}
