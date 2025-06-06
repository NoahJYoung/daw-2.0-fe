import { Mixer } from "../mixer";
import { Timeline } from "../timeline";
import type {
  KeyAnalysisResult,
  UseSelectedOptions,
  RomanNumeralAnalysis,
} from "./types";
import {
  analyzeChordInWindow,
  createPitchClassProfile,
  extractAllMidiNotes,
  groupAnalysisByMeasuresReduce,
  groupNotesByTimeWindows,
  processMeasures,
  findBestKey,
} from "./helpers";

export class HarmonicAnalyzer {
  private mixer: Mixer;
  private timeline: Timeline;
  private cachedKey: KeyAnalysisResult | null = null;

  constructor(mixer: Mixer, timeline: Timeline) {
    this.mixer = mixer;
    this.timeline = timeline;
  }

  public getKey(options?: UseSelectedOptions): KeyAnalysisResult {
    if (this.cachedKey) {
      return this.cachedKey;
    }

    const allNotes = extractAllMidiNotes(
      this.mixer,
      options
        ? { ...options, filterPassingTones: false }
        : { filterPassingTones: false, useSelectedTracksOnly: false }
    );

    if (allNotes.length === 0) {
      throw new Error("No MIDI notes found for key analysis");
    }

    const pitchClassProfile = createPitchClassProfile(allNotes);
    const keyResult = findBestKey(pitchClassProfile);

    this.cachedKey = keyResult;
    return keyResult;
  }

  public getRomanNumeralAnalysis(
    options?: UseSelectedOptions
  ): RomanNumeralAnalysis[][] {
    const keyResult = this.getKey(options);
    const allNotes = extractAllMidiNotes(this.mixer, options);

    if (allNotes.length === 0) {
      return [];
    }

    const timeWindows = groupNotesByTimeWindows(allNotes);
    const analysis: RomanNumeralAnalysis[] = [];

    for (let i = 0; i < timeWindows.length; i++) {
      const window = timeWindows[i];
      if (i > 0) {
        const chordAnalysis = analyzeChordInWindow(
          this.timeline,
          window,
          keyResult,
          analysis[i - 1]
        );
        if (chordAnalysis) {
          analysis.push({
            ...chordAnalysis,
            beat: 1 + (i % this.timeline.timeSignature),
          });
        }
      } else {
        const chordAnalysis = analyzeChordInWindow(
          this.timeline,
          window,
          keyResult
        );
        if (chordAnalysis) {
          analysis.push({
            ...chordAnalysis,
            beat: 1 + (i % this.timeline.timeSignature),
          });
        }
      }
    }

    const groupedAnalysis = groupAnalysisByMeasuresReduce(analysis);
    const processedAnalysis = processMeasures(groupedAnalysis);

    return processedAnalysis;
  }

  public invalidateCache(): void {
    this.cachedKey = null;
  }
}
