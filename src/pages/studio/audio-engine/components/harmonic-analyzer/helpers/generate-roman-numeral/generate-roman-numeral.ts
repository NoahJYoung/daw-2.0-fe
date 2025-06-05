import * as Tonal from "tonal";
import { KeyAnalysisResult, TonalChord } from "../../types";
import { formatRomanNumeral, generateRomanNumeralFromNotes } from "./helpers";
import { analyzeBorrowedChord } from "../analyze-borrowed-chord";

export function generateRomanNumeral(
  chordSymbol: string,
  quality: string,
  keyResult: KeyAnalysisResult,
  noteNames: string[]
): string {
  try {
    const chord = Tonal.Chord.get(chordSymbol) as TonalChord;
    const chordRoot = chord.tonic;

    if (!chordRoot) {
      return generateRomanNumeralFromNotes(noteNames, keyResult, quality);
    }

    const keyScale =
      keyResult.mode === "major"
        ? Tonal.Scale.get(`${keyResult.key} major`).notes
        : Tonal.Scale.get(`${keyResult.key} minor`).notes;

    const rootIndex = keyScale.findIndex(
      (note) => Tonal.Note.chroma(note) === Tonal.Note.chroma(chordRoot)
    );

    if (rootIndex === -1) {
      return analyzeBorrowedChord(chordRoot, chord, keyResult);
    }

    const degree = rootIndex + 1;

    return formatRomanNumeral(degree, quality, keyResult.mode);
  } catch {
    return generateRomanNumeralFromNotes(noteNames, keyResult, quality);
  }
}
