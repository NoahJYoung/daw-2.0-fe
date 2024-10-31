import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";

export const getKeys = () => {
  const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((octave) =>
    ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"].map(
      (note) => [note, octave]
    )
  );

  const flattened: PitchNameTuple[] = [];

  keys.forEach((octave) =>
    octave.forEach((tuple) => flattened.push(tuple as PitchNameTuple))
  );

  return flattened.reverse();
};
