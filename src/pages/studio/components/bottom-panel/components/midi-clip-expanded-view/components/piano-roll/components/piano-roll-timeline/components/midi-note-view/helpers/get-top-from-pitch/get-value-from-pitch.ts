import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";

export const getTopValueFromPitch = (pitch: PitchNameTuple) => {
  const pitchNameArray = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ].reverse();

  const laneHeight = 17.5;
  const noteValue = pitchNameArray.indexOf(pitch[0]);

  const value = noteValue * laneHeight + (1890 - (pitch[1] + 1) * 210);
  const adjustedValue = value - 1;
  return adjustedValue;
};
