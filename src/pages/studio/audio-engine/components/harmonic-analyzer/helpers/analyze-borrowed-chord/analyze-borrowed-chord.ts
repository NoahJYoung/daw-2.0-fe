import * as Tonal from "tonal";
import type { TonalChord, KeyAnalysisResult } from "../../types";

export function analyzeBorrowedChord(
  chordRoot: string,
  chord: TonalChord,
  keyResult: KeyAnalysisResult
): string {
  const rootChroma = Tonal.Note.chroma(chordRoot);
  const keyChroma = Tonal.Note.chroma(keyResult.key);
  const interval = (rootChroma - keyChroma + 12) % 12;

  const borrowedChords: { [key: number]: string } = {
    0: "I",
    1: "bII",
    2: "II",
    3: "bIII",
    4: "III",
    5: "IV",
    6: "bV",
    7: "V",
    8: "bVI",
    9: "VI",
    10: "bVII",
    11: "VII",
  };

  const baseDegree = borrowedChords[interval] || "?";
  const quality = chord.quality || "";
  let result = baseDegree;

  if (quality.includes("m") && !quality.includes("M")) {
    result = result.toLowerCase();
  }
  if (quality.includes("dim")) result += "°";
  if (quality.includes("7")) result += "7";

  return result;
}
