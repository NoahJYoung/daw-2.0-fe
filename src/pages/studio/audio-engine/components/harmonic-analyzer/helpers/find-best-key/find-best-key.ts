import * as Tonal from "tonal";

export interface KeyCandidate {
  key: string;
  correlation: number;
  confidence: number;
  tonic: number;
}

export interface KeyAnalysisResult {
  key: string;
  mode: "major";
  confidence: number;
  pitchClassProfile: number[];
  candidates: KeyCandidate[];
}

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

export function findBestKey(
  pitchClassProfile: number[],
  maxCandidates: number = 6
): KeyAnalysisResult {
  const majorProfile = [
    6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
  ];

  const candidates: KeyCandidate[] = [];

  for (let tonic = 0; tonic < 12; tonic++) {
    const rotatedMajorProfile = rotateArray(majorProfile, tonic);
    const correlation = calculateCorrelation(
      pitchClassProfile,
      rotatedMajorProfile
    );

    const keyName = Tonal.Note.fromMidi(60 + tonic);
    candidates.push({
      key: keyName,
      correlation: correlation,
      confidence: Math.max(0, correlation),
      tonic: tonic,
    });
  }

  const sortedCandidates = candidates
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, maxCandidates);

  const bestCorrelation = sortedCandidates[0]?.correlation || 0;
  const normalizedCandidates = sortedCandidates.map((candidate) => ({
    ...candidate,
    confidence:
      bestCorrelation > 0 ? candidate.correlation / bestCorrelation : 0,
  }));

  const primaryKey = normalizedCandidates[0];

  return {
    key: primaryKey.key,
    mode: "major",
    confidence: primaryKey.confidence,
    pitchClassProfile,
    candidates: normalizedCandidates,
  };
}
