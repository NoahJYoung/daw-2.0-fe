import * as Tonal from "tonal";
import * as Tone from "tone";
import type {
  ProcessedNote,
  KeyAnalysisResult,
  RomanNumeralAnalysis,
  TonalChord,
} from "../../types";
import { getSamplesPerMeasure } from "../get-samples-per-measure";
import type { Timeline } from "../../../timeline";
import { generateRomanNumeral } from "../generate-roman-numeral";
import { prepareChordSymbol } from "../prepare-chord-symbol";

export function analyzeChordInWindow(
  timeline: Timeline,
  notes: ProcessedNote[],
  keyResult: KeyAnalysisResult,
  prevChord?: RomanNumeralAnalysis
): RomanNumeralAnalysis | null {
  if (notes.length < 2) {
    return null;
  }

  const noteNames = notes.map((p) => Tonal.Note.fromMidi(60 + p.pitch));

  const chordCandidates = [...Tonal.Chord.detect(noteNames)].filter(Boolean);

  let chordSymbol = "";
  if (chordCandidates.length === 0) {
    let scale = Tonal.Scale.detect([...noteNames])?.[0] || "";
    if (prevChord) {
      const prevChordScaleOptions = Tonal.Chord.chordScales(
        prevChord.tonalChordSymbol
      ).map((scale) => `${prevChord.root} ${scale}`);
      const currentChordScaleOptions = Tonal.Scale.detect([
        ...noteNames.map((noteName) => noteName.replace(/\d/g, "")),
      ]);
      const matchingChordScale = prevChordScaleOptions.find((scale) =>
        currentChordScaleOptions.includes(scale)
      );

      if (matchingChordScale) {
        scale = matchingChordScale;
      }
    } else {
      scale = Tonal.Scale.detect([...noteNames])?.[0];
    }
    const scaleObject = Tonal.Scale.get(scale);
    const notesInScale = scaleObject.notes;
    const rootIndex = 0;
    const triad = [
      notesInScale[0],
      notesInScale[(rootIndex + 2) % 7],
      notesInScale[(rootIndex + 4) % 7],
    ];

    const extended = [...triad];

    noteNames.forEach((noteName) => {
      if (!extended.includes(noteName)) {
        extended.push(noteName);
      }
    });
    chordSymbol = Tonal.Chord.detect(extended)?.[0] || "";
  } else {
    chordSymbol = chordCandidates?.[0] || noteNames.join("/");
  }

  // TODO: Fix issue where first inversion major chords sometimes appear as minor #5 chords.
  // EXAMPLE:
  // expected: G/B
  // received: Bm#5
  const chord = Tonal.Chord.get(chordSymbol) as TonalChord;

  const root = chord.tonic;

  const scale = Tonal.Scale.get(`${keyResult.key} ${keyResult.mode}`);

  const notesInScale = scale.notes;

  const diatonicTriads = notesInScale.map((_, i) => {
    const triad = [
      notesInScale[i],
      notesInScale[(i + 2) % 7],
      notesInScale[(i + 4) % 7],
    ];
    const triadSymbol = Tonal.Chord.detect(triad)[0];
    return Tonal.Chord.get(triadSymbol);
  });

  const matchingDiatonicTriad = diatonicTriads.find(
    (triad) => triad.tonic === chord.tonic
  );

  const quality =
    chord.quality === "Unknown"
      ? matchingDiatonicTriad?.quality || "Unknown"
      : chord.quality;

  const romanNumeral = generateRomanNumeral(
    chordSymbol,
    quality,
    keyResult,
    noteNames
  );

  const windowStart = Math.min(...notes.map((n) => n.absoluteStartTime));
  const measure = Math.floor(windowStart / getSamplesPerMeasure(timeline));
  const beat =
    Math.floor(
      (windowStart % Tone.Time("1m").toSamples()) / Tone.Time("4n").toSamples()
    ) + 1;

  return {
    measure,
    beat,
    root,
    tonalChordSymbol: chordSymbol,
    chordSymbol: prepareChordSymbol(chordSymbol),
    quality,
    romanNumeral,
    key: `${keyResult.key.replace(/\d/g, "")} ${keyResult.mode}`,
  };
}
