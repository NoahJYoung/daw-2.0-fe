import * as Tone from "tone";

export function getSamplesPerBeat(): number {
  return Tone.Time("4n").toSamples();
}
