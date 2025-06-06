export interface KeyAnalysisResult {
  key: string;
  mode: "major" | "minor";
  confidence: number;
  pitchClassProfile: number[];
}

export interface RomanNumeralAnalysis {
  measure: number;
  beat: number;
  root: string;
  tonalChordSymbol: string;
  chordSymbol: string;
  romanNumeral: string;
  key: string;
  quality: string;
  chordScale?: string;
}

export interface ProcessedNote {
  absoluteStartTime: number;
  absoluteEndTime: number;
  pitch: number;
  velocity: number;
  duration: number;
}

export interface WeightedPitchClass {
  pitchClass: number;
  weight: number;
}

export interface TonalChord {
  symbol: string;
  tonic: string;
  bass: string;
  root: string;
  rootDegree: number;
  name: string;
  quality: string;
  intervals: string[];
  notes: string[];
}

export interface UseSelectedOptions {
  useSelectedTracksOnly: boolean;
  filterPassingTones?: boolean;
}
