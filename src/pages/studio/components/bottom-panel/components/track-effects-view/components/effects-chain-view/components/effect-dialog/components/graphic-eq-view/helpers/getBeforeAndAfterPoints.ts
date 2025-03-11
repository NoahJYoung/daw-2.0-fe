import { Band } from "@/pages/studio/audio-engine/components/effects/graphic-eq/components";
import { Point } from "../types";

export const getBeforeAndAfterPoints = (band: Band): Point[] => {
  const { frequency, gain, Q } = band;
  const octaveFraction = 1 / Q;
  const lowerFrequencyFactor = Math.pow(2, -octaveFraction);
  const upperFrequencyFactor = Math.pow(2, octaveFraction);

  switch (band.type) {
    case "highpass": {
      const before = { type: "marker", frequency: 1, gain: 0 };
      const prev = { type: "marker", frequency: 10, gain: -24 };
      const main = {
        type: "marker",
        frequency: frequency * lowerFrequencyFactor,
        gain: -24,
      };
      const after = { type: "highpass", frequency, gain: 0 };
      return [before, prev, main, after] as Point[];
    }
    case "highshelf": {
      const before = {
        type: "marker",
        frequency: frequency * 0.9 * lowerFrequencyFactor,
        gain: 0,
      };
      const main = { type: "highshelf", frequency, gain };
      const after = {
        type: "marker",
        frequency: 45000,
        gain: gain,
      };
      const end = { type: "marker", frequency: 45001, gain: 0 };
      return [before, main, after, end] as Point[];
    }
    default:
    case "peaking": {
      const before = {
        type: "marker",
        frequency: frequency * lowerFrequencyFactor,
        gain: 0,
        id: band.id,
      };

      const main = { type: "peaking", frequency, gain };

      const after = {
        type: "marker",
        frequency: Math.round(frequency * upperFrequencyFactor),
        gain: 0,
        id: band.id,
      };

      return [before, main, after] as Point[];
    }
  }
};
