import * as Tonal from "tonal";
import type { RomanNumeralAnalysis } from "../../types";
import { prepareChordSymbol } from "../prepare-chord-symbol";
import { romanNumeralToChordScaleMap } from "../../roman-numeral-to-chord-scale-map";

function processSingleMeasure(chords: RomanNumeralAnalysis[]) {
  const processedChords: RomanNumeralAnalysis[] = [];

  chords.forEach((chord) => {
    if (
      processedChords.length === 0 ||
      processedChords[processedChords.length - 1].romanNumeral !==
        chord.romanNumeral
    ) {
      if (chord.quality !== "Unknown") {
        processedChords.push(chord);
      } else {
        const prevChord = processedChords[processedChords.length - 1];

        if (
          chord.quality === "Unknown" &&
          chord.tonalChordSymbol.split("/").length > 0
        ) {
          const combinedChordNotes = prevChord?.tonalChordSymbol
            ? [
                ...Tonal.Chord.notes(prevChord?.tonalChordSymbol),
                ...chord.tonalChordSymbol
                  .split("/")
                  .map((noteName) => noteName.replace(/\d/g, "")),
              ]
            : [
                ...chord.tonalChordSymbol
                  .split("/")
                  .map((noteName) => noteName.replace(/\d/g, "")),
              ];

          const newChordSymbol = Tonal.Chord.detect(combinedChordNotes)[0];

          const combinedAnalysis = {
            ...prevChord,
            tonalChordSymbol: newChordSymbol,
            chordSymbol: prepareChordSymbol(newChordSymbol),
            quality: Tonal.Chord.get(newChordSymbol).quality,
          };
          processedChords[processedChords.length - 1] = combinedAnalysis;
        }
      }
    } else {
      const prevChord = processedChords[processedChords.length - 1];

      const combinedChordNotes = [
        ...Tonal.Chord.notes(prevChord?.tonalChordSymbol || ""),
        ...Tonal.Chord.notes(chord.tonalChordSymbol || ""),
      ];

      const newChordSymbol = Tonal.Chord.detect(combinedChordNotes)[0];

      const combinedAnalysis = {
        ...prevChord,
        tonalChordSymbol: newChordSymbol,
        chordSymbol: prepareChordSymbol(newChordSymbol),
        quality: Tonal.Chord.get(newChordSymbol).quality,
      };
      processedChords[processedChords.length - 1] = combinedAnalysis;
    }
  });

  const processedChordsWithChordScales = processedChords.map((chord) => {
    const getChordScale = () => {
      if (
        Tonal.Chord.chordScales(chord.tonalChordSymbol || "").includes(
          romanNumeralToChordScaleMap[chord.romanNumeral]
        )
      ) {
        return romanNumeralToChordScaleMap[chord.romanNumeral];
      }

      return Tonal.Chord.chordScales(chord.tonalChordSymbol)?.[0];
    };

    const chordScale = getChordScale();

    return { ...chord, chordScale };
  });

  return processedChordsWithChordScales;
}

export const processMeasures = (measures: RomanNumeralAnalysis[][]) =>
  measures.map((measure) => processSingleMeasure(measure));
