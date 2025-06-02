import * as Tonal from "tonal";
import * as Tone from "tone";
import { Mixer } from "../mixer";
import { Timeline } from "../timeline";
import { MidiClip } from "../midi-clip";

interface KeyAnalysisResult {
  key: string;
  mode: "major" | "minor";
  confidence: number;
  pitchClassProfile: number[];
}

interface RomanNumeralAnalysis {
  measure: number;
  beat: number;
  chord: string;
  romanNumeral: string;
  key: string;
  confidence: number;
}

interface ProcessedNote {
  absoluteStartTime: number;
  absoluteEndTime: number;
  pitch: number;
  velocity: number;
  duration: number;
}

interface WeightedPitchClass {
  pitchClass: number;
  weight: number;
}

interface TonalChord {
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

export class HarmonicAnalyzer {
  private mixer: Mixer;
  private timeline: Timeline;
  private cachedKey: KeyAnalysisResult | null = null;

  constructor(mixer: Mixer, timeline: Timeline) {
    this.mixer = mixer;
    this.timeline = timeline;
  }

  public getKey(): KeyAnalysisResult {
    if (this.cachedKey) {
      return this.cachedKey;
    }

    const allNotes = this.extractAllMidiNotes();

    console.log(allNotes);

    if (allNotes.length === 0) {
      throw new Error("No MIDI notes found for key analysis");
    }

    const pitchClassProfile = this.createPitchClassProfile(allNotes);
    const keyResult = this.findBestKey(pitchClassProfile);

    this.cachedKey = keyResult;
    return keyResult;
  }

  public getRomanNumeralAnalysis(): RomanNumeralAnalysis[] {
    const keyResult = this.getKey();
    const allNotes = this.extractAllMidiNotes();
    console.log(allNotes);

    if (allNotes.length === 0) {
      return [];
    }

    const timeWindows = this.groupNotesByTimeWindows(allNotes);
    const analysis: RomanNumeralAnalysis[] = [];

    for (let i = 0; i < timeWindows.length; i++) {
      const window = timeWindows[i];
      const chordAnalysis = this.analyzeChordInWindow(window, keyResult);
      if (chordAnalysis) {
        analysis.push(chordAnalysis);
      }
    }

    return analysis;
  }

  private extractAllMidiNotes(): ProcessedNote[] {
    const allNotes: ProcessedNote[] = [];

    for (const track of this.mixer.tracks) {
      for (const clip of track.clips) {
        if (clip.type !== "midi") {
          continue;
        }

        const midiClip = clip as MidiClip;

        for (const note of midiClip.events) {
          const absoluteStartTime = midiClip.start + note.on;
          const absoluteEndTime = midiClip.start + note.off;

          allNotes.push({
            absoluteStartTime: Tone.Time(
              Tone.Time(absoluteStartTime, "samples").quantize("16n"),
              "s"
            ).toSamples(),
            absoluteEndTime: Tone.Time(
              Tone.Time(absoluteEndTime, "samples").quantize("16n"),
              "s"
            ).toSamples(),
            pitch: Tone.Midi(note.note.join("")).valueOf(),
            velocity: note.velocity,
            duration: absoluteEndTime - absoluteStartTime,
          });
        }
      }
    }

    return allNotes.sort((a, b) => {
      if (a.absoluteStartTime === b.absoluteStartTime) {
        return a.pitch - b.pitch;
      }
      return a.absoluteStartTime - b.absoluteStartTime;
    });
  }

  private createPitchClassProfile(notes: ProcessedNote[]): number[] {
    const profile = new Array(12).fill(0);

    for (const note of notes) {
      const pitchClass = note.pitch % 12;
      const weight = (note.duration / 1000) * (note.velocity / 127);
      profile[pitchClass] += weight;
    }

    const sum = profile.reduce((a, b) => a + b, 0);
    return sum > 0 ? profile.map((p) => p / sum) : profile;
  }

  private findBestKey(pitchClassProfile: number[]): KeyAnalysisResult {
    const majorProfile = [
      6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
    ];
    const minorProfile = [
      6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
    ];

    let bestKey = "C";
    let bestMode: "major" | "minor" = "major";
    let bestCorrelation = -1;

    for (let tonic = 0; tonic < 12; tonic++) {
      const rotatedMajorProfile = this.rotateArray(majorProfile, tonic);
      const majorCorrelation = this.calculateCorrelation(
        pitchClassProfile,
        rotatedMajorProfile
      );

      if (majorCorrelation > bestCorrelation) {
        bestCorrelation = majorCorrelation;
        bestKey = Tonal.Note.fromMidi(60 + tonic);
        bestMode = "major";
      }

      const rotatedMinorProfile = this.rotateArray(minorProfile, tonic);
      const minorCorrelation = this.calculateCorrelation(
        pitchClassProfile,
        rotatedMinorProfile
      );

      if (minorCorrelation > bestCorrelation) {
        bestCorrelation = minorCorrelation;
        bestKey = Tonal.Note.fromMidi(60 + tonic);
        bestMode = "minor";
      }
    }

    return {
      key: bestKey,
      mode: bestMode,
      confidence: Math.max(0, bestCorrelation),
      pitchClassProfile,
    };
  }

  private groupNotesByTimeWindows(notes: ProcessedNote[]): ProcessedNote[][] {
    if (notes.length === 0) return [];

    const samplesPerQuarter = this.getSamplesPerBeat();
    const windows: ProcessedNote[][] = [];
    const maxTime = Math.max(...notes.map((n) => n.absoluteEndTime));

    for (let start = 0; start < maxTime; start += samplesPerQuarter) {
      const end = start + samplesPerQuarter;
      const windowNotes = notes.filter(
        (note) => note.absoluteStartTime < end && note.absoluteEndTime > start
      );

      if (windowNotes.length > 0) {
        windows.push(windowNotes.sort((a, b) => a.pitch - b.pitch));
      }
    }

    console.log({ windows });
    return windows;
  }

  private analyzeChordInWindow(
    notes: ProcessedNote[],
    keyResult: KeyAnalysisResult
  ): RomanNumeralAnalysis | null {
    if (notes.length === 0) return null;

    const pitchData = this.getWeightedPitchClasses(notes);

    if (pitchData.length < 2) return null;

    const sortedPitches = pitchData.sort((a, b) => b.weight - a.weight);
    // const noteNames = sortedPitches.map((p) =>
    //   Tonal.Note.fromMidi(60 + p.pitchClass)
    // );

    const noteNames = notes.map((p) => Tonal.Note.fromMidi(60 + p.pitch));

    const chordCandidates = [
      ...Tonal.Chord.detect(noteNames),
      // ...Tonal.Chord.detect(noteNames.slice(0, 4)),
      // ...Tonal.Chord.detect([noteNames[0], noteNames[1], noteNames[2]]),
    ].filter(Boolean);

    console.log({ notes, chordCandidates });

    const chordSymbol = chordCandidates[0] || noteNames.join("/");
    const romanNumeral = this.generateRomanNumeral(
      chordSymbol,
      keyResult,
      noteNames
    );

    const windowStart = Math.min(...notes.map((n) => n.absoluteStartTime));
    const measure = Math.floor(windowStart / this.getSamplesPerMeasure()) + 1;
    const beat =
      Math.floor(
        (windowStart % this.getSamplesPerMeasure()) / this.getSamplesPerBeat()
      ) + 1;
    const confidence = this.calculateConfidence(
      chordSymbol,
      pitchData,
      keyResult
    );

    return {
      measure,
      beat,
      chord: chordSymbol,
      romanNumeral,
      key: `${keyResult.key} ${keyResult.mode}`,
      confidence,
    };
  }

  private getWeightedPitchClasses(
    notes: ProcessedNote[]
  ): WeightedPitchClass[] {
    const pitchWeights = new Map<number, number>();

    for (const note of notes) {
      const pitchClass = note.pitch % 12;
      const weight = (note.duration / 1000) * (note.velocity / 127);
      pitchWeights.set(
        pitchClass,
        (pitchWeights.get(pitchClass) || 0) + weight
      );
    }

    return Array.from(pitchWeights.entries())
      .map(([pitchClass, weight]) => ({ pitchClass, weight }))
      .filter((item) => item.weight > 0);
  }

  private generateRomanNumeral(
    chordSymbol: string,
    keyResult: KeyAnalysisResult,
    noteNames: string[]
  ): string {
    try {
      const chord = Tonal.Chord.get(chordSymbol) as TonalChord;
      const chordRoot = chord.tonic;

      if (!chordRoot) {
        return this.generateRomanNumeralFromNotes(noteNames, keyResult);
      }

      const keyScale =
        keyResult.mode === "major"
          ? Tonal.Scale.get(`${keyResult.key} major`).notes
          : Tonal.Scale.get(`${keyResult.key} minor`).notes;

      const rootIndex = keyScale.findIndex(
        (note) => Tonal.Note.chroma(note) === Tonal.Note.chroma(chordRoot)
      );

      if (rootIndex === -1) {
        return this.analyzeBorrowedChord(chordRoot, chord, keyResult);
      }

      const degree = rootIndex + 1;
      const quality = chord.quality || "";

      return this.formatRomanNumeral(degree, quality, keyResult.mode);
    } catch {
      return this.generateRomanNumeralFromNotes(noteNames, keyResult);
    }
  }

  private formatRomanNumeral(
    degree: number,
    quality: string,
    mode: "major" | "minor"
  ): string {
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
    const base = romanNumerals[degree - 1];

    if (!base) return "?";

    const isMinorChord = quality.includes("m") && !quality.includes("M");
    const isDiminished = quality.includes("dim") || quality.includes("°");
    const isAugmented = quality.includes("aug") || quality.includes("+");

    let result = base;

    if (mode === "major") {
      const naturalMinor = [2, 3, 6, 7].includes(degree);

      if (
        (naturalMinor && !isMinorChord) ||
        (!naturalMinor && isMinorChord && !isDiminished)
      ) {
        result = naturalMinor ? base : base.toLowerCase();
      } else if (naturalMinor || isMinorChord) {
        result = base.toLowerCase();
      }
    } else {
      const naturallyMajor = [3, 6, 7].includes(degree);
      result = naturallyMajor ? base : base.toLowerCase();
    }

    if (isDiminished) result += "°";
    if (isAugmented) result += "+";
    if (quality.includes("7")) result += "7";
    if (quality.includes("9")) result += "9";

    return result;
  }

  private analyzeBorrowedChord(
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

  private generateRomanNumeralFromNotes(
    noteNames: string[],
    keyResult: KeyAnalysisResult
  ): string {
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
      return hasMinorThird ? base.toLowerCase() : base;
    }

    return noteNames.join("/");
  }

  private calculateConfidence(
    chordSymbol: string,
    pitchData: WeightedPitchClass[],
    keyResult: KeyAnalysisResult
  ): number {
    try {
      const chord = Tonal.Chord.get(chordSymbol) as TonalChord;
      if (!chord.notes || chord.notes.length === 0) return 0.3;

      const chordPitchClasses = chord.notes.map((note) =>
        Tonal.Note.chroma(note)
      );
      const presentChordTones = pitchData.filter((p) =>
        chordPitchClasses.includes(p.pitchClass)
      );

      const coverage =
        presentChordTones.length / Math.max(chordPitchClasses.length, 1);
      const totalWeight = pitchData.reduce((sum, p) => sum + p.weight, 0);
      const chordToneWeight = presentChordTones.reduce(
        (sum, p) => sum + p.weight,
        0
      );
      const weightRatio = totalWeight > 0 ? chordToneWeight / totalWeight : 0;

      const diatonicChords =
        keyResult.mode === "major"
          ? Tonal.Key.majorKey(keyResult.key).chords
          : Tonal.Key.minorKey(keyResult.key).natural.chords;
      const isDiatonic = diatonicChords.includes(chordSymbol);
      const diatonicBonus = isDiatonic ? 0.2 : 0;

      return Math.min(1, coverage * 0.4 + weightRatio * 0.4 + diatonicBonus);
    } catch {
      return 0.3;
    }
  }

  private rotateArray<T>(arr: T[], positions: number): T[] {
    const len = arr.length;
    const actualPositions = ((positions % len) + len) % len;
    return arr.slice(actualPositions).concat(arr.slice(0, actualPositions));
  }

  private calculateCorrelation(a: number[], b: number[]): number {
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

  private getSamplesPerBeat(): number {
    return Tone.Time("4n").toSamples();
  }

  private getBeatsPerMeasure(): number {
    const numerator = this.timeline.timeSignature;
    return numerator;
  }

  private getSamplesPerMeasure(): number {
    return this.getSamplesPerBeat() * this.getBeatsPerMeasure();
  }

  public invalidateCache(): void {
    this.cachedKey = null;
  }
}
