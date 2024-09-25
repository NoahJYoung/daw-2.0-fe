import { Timeline } from "@/pages/studio/audio-engine/components";
import * as Tone from "tone";

export const subdivisionToQuarterMap: Record<string, number> = {
  ["1n"]: 0.25,
  ["2n"]: 0.5,
  ["2t"]: 0.75,
  ["4n"]: 1,
  ["4t"]: 1.5,
  ["8n"]: 2,
  ["8t"]: 3,
  ["16n"]: 4,
  ["16t"]: 6,
};

export const findSmallestSubdivision = (timeline: Timeline) => {
  const tupletTime =
    timeline.subdivision.split("")[timeline.subdivision.split("").length - 1];

  const subdivisionsToRender = Object.keys(subdivisionToQuarterMap).filter(
    (subdivision) =>
      timeline.samplesToPixels(Tone.Time(subdivision).toSamples()) >= 16 &&
      subdivision.split("")[subdivision.split("").length - 1] === tupletTime
  );

  if (subdivisionsToRender.includes(timeline.subdivision)) {
    return timeline.subdivision;
  }

  if (subdivisionsToRender.length === 0) {
    return "1n";
  }

  return subdivisionsToRender[subdivisionsToRender.length - 1];
};
