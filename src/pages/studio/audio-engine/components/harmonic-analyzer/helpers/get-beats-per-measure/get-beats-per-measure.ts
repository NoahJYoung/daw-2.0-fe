import type { Timeline } from "../../../timeline";

export function getBeatsPerMeasure(timeline: Timeline): number {
  const numerator = timeline.timeSignature;
  return numerator;
}
