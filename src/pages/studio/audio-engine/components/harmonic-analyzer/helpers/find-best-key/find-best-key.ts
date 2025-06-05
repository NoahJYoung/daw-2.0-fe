import * as Tonal from "tonal";
import { KeyAnalysisResult } from "../../types";

function rotateArray<T>(arr: T[], positions: number): T[] {
  const len = arr.length;
  const actualPositions = ((positions % len) + len) % len;
  return arr
    .slice(len - actualPositions)
    .concat(arr.slice(0, len - actualPositions));
}

function calculateCorrelation(a: number[], b: number[]): number {
  const n = a.length;
  const sumA = a.reduce((sum, val) => sum + val, 0);
  const sumB = b.reduce((sum, val) => sum + val, 0);
  const meanA = sumA / n;
  const meanB = sumB / n;

  let numerator = 0;
  let sumSquareA = 0;
  let sumSquareB = 0;

  for (let i = 0; i < n; i++) {
    const diffA = a[i] - meanA;
    const diffB = b[i] - meanB;
    numerator += diffA * diffB;
    sumSquareA += diffA * diffA;
    sumSquareB += diffB * diffB;
  }

  const denominator = Math.sqrt(sumSquareA * sumSquareB);
  return denominator === 0 ? 0 : numerator / denominator;
}

export function findBestKey(pitchClassProfile: number[]): KeyAnalysisResult {
  const majorProfile = [
    6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
  ];
  const minorProfile = [
    6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
  ];

  let bestKey = "C";
  let bestMode: "major" | "minor" = "major";
  let bestCorrelation = -1;
  let detectedTonic = 0;

  for (let tonic = 0; tonic < 12; tonic++) {
    const rotatedMajorProfile = rotateArray(majorProfile, tonic);
    const majorCorrelation = calculateCorrelation(
      pitchClassProfile,
      rotatedMajorProfile
    );

    const rotatedMinorProfile = rotateArray(minorProfile, tonic);
    const minorCorrelation = calculateCorrelation(
      pitchClassProfile,
      rotatedMinorProfile
    );

    if (majorCorrelation > bestCorrelation) {
      bestCorrelation = majorCorrelation;
      detectedTonic = tonic;
      bestMode = "major";
    }

    if (minorCorrelation > bestCorrelation) {
      bestCorrelation = minorCorrelation;
      detectedTonic = tonic;
      bestMode = "minor";
    }
  }

  if (bestMode === "minor") {
    const relativeMajorTonic = (detectedTonic + 3) % 12;
    bestKey = Tonal.Note.fromMidi(60 + relativeMajorTonic);
  } else {
    bestKey = Tonal.Note.fromMidi(60 + detectedTonic);
  }

  return {
    key: bestKey,
    mode: "major",
    confidence: Math.max(0, bestCorrelation),
    pitchClassProfile,
  };
}
