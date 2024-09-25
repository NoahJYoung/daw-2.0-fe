import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import {
  Peak,
  waveformCache,
} from "@/pages/studio/audio-engine/components/waveform-cache";
import { useAudioEngine } from "@/pages/studio/hooks";
import { useLayoutEffect, useState } from "react";
import { normalizePeaks } from "./helpers";
import { MAX_WAVEFORM_WIDTH } from "@/pages/studio/utils/constants";

interface UseWaveformOptions {
  loop?: boolean;
}

export const useWaveform = (
  clip: AudioClip,
  track: Track,
  options?: UseWaveformOptions
) => {
  const { timeline } = useAudioEngine();
  const width = timeline.samplesToPixels(clip.length);

  const adjustedHeight = track.laneHeight - 30;

  const waveformMagnificationValue = 1;

  const [peakChunks, setPeakChunks] = useState<Peak[][]>([]);

  useLayoutEffect(() => {
    if (clip.buffer) {
      if (!waveformCache.has(clip.id, timeline.samplesPerPixel)) {
        throw new Error("no waveform data found");
      }
      const cachedPeaks = waveformCache.get(clip.id, timeline.samplesPerPixel);

      if (cachedPeaks) {
        const loopPeakLength = clip.loopSamples / timeline.samplesPerPixel;
        let preparedPeaks: Peak[] = [];

        if (options?.loop) {
          const totalPeaks = cachedPeaks.length;

          while (preparedPeaks.length < loopPeakLength) {
            const remainingPeaks = loopPeakLength - preparedPeaks.length;
            const sliceLength = Math.min(remainingPeaks, totalPeaks);

            preparedPeaks = preparedPeaks.concat(
              cachedPeaks.slice(0, sliceLength)
            );
          }
        } else {
          preparedPeaks = cachedPeaks;
        }

        const normalizedPeaks = normalizePeaks(
          preparedPeaks,
          adjustedHeight,
          waveformMagnificationValue
        );

        const newPeakChunks: Peak[][] = [];
        const totalChunks = Math.ceil(
          normalizedPeaks.length / MAX_WAVEFORM_WIDTH
        );

        for (let i = 0; i < totalChunks; i++) {
          const startSamples = i * MAX_WAVEFORM_WIDTH;
          const endSamples = Math.min(
            startSamples + MAX_WAVEFORM_WIDTH,
            normalizedPeaks.length
          );
          const chunk = normalizedPeaks.slice(startSamples, endSamples);
          newPeakChunks.push(chunk);
        }

        setPeakChunks(newPeakChunks);
      }
    }
  }, [
    clip.loopSamples,
    options?.loop,
    clip.buffer,
    timeline.samplesPerPixel,
    track.laneHeight,
    clip.length,
    track.color,
    width,
    waveformMagnificationValue,
    adjustedHeight,
    clip.id,
  ]);

  return {
    width,
    height: adjustedHeight,
    peakChunks,
    samplesPerPixel: timeline.samplesPerPixel,
    loopWidth:
      clip.loopSamples > 0 ? clip.loopSamples / timeline.samplesPerPixel : 0,
  };
};
