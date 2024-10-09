export type PitchName =
  | "C"
  | "Db"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "Gb"
  | "G"
  | "Ab"
  | "A"
  | "Bb"
  | "B";

export type EnharmonicPitchName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export const enharmonicPitchNames: Record<PitchName, EnharmonicPitchName> = {
  C: "C",
  Db: "C#",
  D: "D",
  Eb: "D#",
  E: "E",
  F: "F",
  Gb: "F#",
  G: "G",
  Ab: "G#",
  A: "A",
  Bb: "A#",
  B: "B",
};

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PitchNameTuple = [PitchName | EnharmonicPitchName, Octave];

export class Pitch {
  constructor(public pitchName: PitchName, public octave: Octave) {}

  get name() {
    return `${this.pitchName}${this.octave}`;
  }

  get enharmonic() {
    return `${enharmonicPitchNames[this.pitchName]}${this.octave}`;
  }
}
