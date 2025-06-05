import { Timeline } from "../../audio-engine/components";
import { RomanNumeralAnalysis } from "../../audio-engine/components/harmonic-analyzer/types";
import * as Tonal from "tonal";

export const getQualityColor = (quality: string): string => {
  switch (quality) {
    case "major":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
    case "minor":
      return "bg-zinc-200text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100";
    case "dominant":
      return "bg-zinc-300 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-100";
    case "diminished":
      return "bg-zinc-400 text-white dark:bg-zinc-500 dark:text-zinc-100";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
};

export const getChordNotes = (chordAnalysis: RomanNumeralAnalysis) => {
  return Tonal.Chord.notes(chordAnalysis.tonalChordSymbol);
};

export const getChordDuration = (
  timeline: Timeline,
  chordsInMeasure: RomanNumeralAnalysis[],
  currentChordIndex: number
): number => {
  const currentChord = chordsInMeasure[currentChordIndex];
  const nextChord = chordsInMeasure[currentChordIndex + 1];

  if (nextChord) {
    return nextChord.beat - currentChord.beat;
  } else {
    return timeline.timeSignature + 1 - currentChord.beat;
  }
};

export const getChordStartPosition = (chord: RomanNumeralAnalysis): number => {
  return chord.beat - 1;
};
