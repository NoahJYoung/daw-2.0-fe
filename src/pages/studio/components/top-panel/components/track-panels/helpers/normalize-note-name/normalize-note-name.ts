import { validateTrackNameForSampler } from "../validate-track-name-for-sampler";

export const normalizeNoteName = (noteName: string): string | undefined => {
  if (!validateTrackNameForSampler(noteName)) {
    return;
  }

  const noteRegex = /^([a-g])([#b])?([1-8])$/i;
  const match = noteRegex.exec(noteName);

  if (!match) {
    return;
  }

  const [, noteLetter, accidental, octave] = match;

  const capitalizedLetter = noteLetter.toUpperCase();

  let normalizedAccidental = accidental ? accidental.toLowerCase() : "";
  let finalNoteLetter = capitalizedLetter;

  const sharpToFlatMap: Record<string, string> = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
  };

  if (normalizedAccidental === "#") {
    const sharpNote = capitalizedLetter + "#";
    if (sharpToFlatMap[sharpNote]) {
      finalNoteLetter = sharpToFlatMap[sharpNote][0];
      normalizedAccidental = "b";
    }
  }

  return finalNoteLetter + normalizedAccidental + octave;
};
