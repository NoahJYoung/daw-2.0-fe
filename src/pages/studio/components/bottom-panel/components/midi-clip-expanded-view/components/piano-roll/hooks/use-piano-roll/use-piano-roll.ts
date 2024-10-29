import { MidiClip } from "@/pages/studio/audio-engine/components";
import * as Tone from "tone";
import { getKeys } from "./helpers";
import { useMemo, useState } from "react";
import {
  MAX_SAMPLES_PER_PIXEL,
  MIN_SAMPLES_PER_PIXEL,
} from "@/pages/studio/audio-engine/constants";

export const usePianoRoll = (clip: MidiClip) => {
  const [samplesPerPixel, setSamplesPerPixel] = useState(128);

  const startingMeasure = parseInt(
    Tone.Time(clip.start, "samples").toBarsBeatsSixteenths().split(":")[0]
  );

  const endingMeasure =
    parseInt(
      Tone.Time(clip.end, "samples").toBarsBeatsSixteenths().split(":")[0]
    ) + 1;

  const keys = useMemo(() => getKeys(), []);

  const samplesToPixels = (samples: number) => {
    return samples / samplesPerPixel;
  };

  const pixelsToSamples = (pixels: number) => {
    return pixels * samplesPerPixel;
  };

  const zoomIn = () => {
    setSamplesPerPixel((prev) =>
      prev / 2 >= MIN_SAMPLES_PER_PIXEL ? prev / 2 : prev
    );
  };

  const zoomOut = () => {
    setSamplesPerPixel((prev) =>
      prev * 2 <= MAX_SAMPLES_PER_PIXEL ? prev * 2 : prev
    );
  };

  const lengthInMeasures = endingMeasure - startingMeasure;

  const width = samplesToPixels(Tone.Time(lengthInMeasures, "m").toSamples());

  return { keys, zoomIn, zoomOut, samplesToPixels, pixelsToSamples, width };
};
