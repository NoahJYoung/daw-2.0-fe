import { Mixer } from "../mixer";
import { Timeline } from "../timeline";
import type {
  KeyAnalysisResult,
  MidiNoteExtractionOptions,
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

  constructor(mixer: Mixer, timeline: Timeline) {
    this.mixer = mixer;
    this.timeline = timeline;
  }

  public getKey(options?: MidiNoteExtractionOptions): KeyAnalysisResult {
    const extendedOptions: MidiNoteExtractionOptions = options
      ? {
          ...options,
          filterChromaticPassingTones: true,
          filterDiatonicPassingTones: false,
        }
      : {
          filterChromaticPassingTones: true,
          filterDiatonicPassingTones: false,
        };

    const allNotes = extractAllMidiNotes(this.mixer, extendedOptions);

    if (allNotes.length === 0) {
      throw new Error("No MIDI notes found for key analysis");
    }

    const pitchClassProfile = createPitchClassProfile(allNotes);
    const keyResult = findBestKey(pitchClassProfile);

    return keyResult;
  }

  public getRomanNumeralAnalysis(
    options?: MidiNoteExtractionOptions
  ): RomanNumeralAnalysis[][] {
    const keyResult = this.getKey(options);

    const extendedOptions: MidiNoteExtractionOptions = options
      ? {
          ...options,
          filterChromaticPassingTones: true,
          filterDiatonicPassingTones: true,
        }
      : { filterChromaticPassingTones: true, filterDiatonicPassingTones: true };

    const allNotes = extractAllMidiNotes(this.mixer, extendedOptions);

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
}
