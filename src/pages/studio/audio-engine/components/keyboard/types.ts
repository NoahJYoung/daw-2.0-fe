import { PitchName, Octave, PitchNameTuple } from "../midi-note/types";

export interface KeyData {
  note: PitchName;
  relativeOctave: Octave;
  type: "black" | "white";
  keyboardKey: string;
}

export interface EventData {
  note: PitchNameTuple;
  on: number;
  off: number;
  velocity?: number;
}

export type OnEventData = Omit<EventData, "off">;
