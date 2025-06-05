import type { Timeline } from "../../../timeline";
import { getBeatsPerMeasure } from "../get-beats-per-measure";
import { getSamplesPerBeat } from "../get-samples-per-beat";

export function getSamplesPerMeasure(timeline: Timeline): number {
  return getSamplesPerBeat() * getBeatsPerMeasure(timeline);
}
