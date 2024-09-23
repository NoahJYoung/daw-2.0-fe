import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import {
  Peak,
  waveformCache,
} from "@/pages/studio/audio-engine/components/waveform-cache";
import { useAudioEngine } from "@/pages/studio/hooks";
import { useEffect, useState } from "react";
import { normalizePeaks } from "./helpers";

export const useWaveform = (clip: AudioClip, track: Track) => {
  const { timeline } = useAudioEngine();
  const width = timeline.samplesToPixels(clip.length);

  const adjustedHeight = track.laneHeight - 30;

  const waveformMagnificationValue = 1;

  const maxCanvasWidth = 4000;
  const [peakChunks, setPeakChunks] = useState<Peak[][]>([]);

  useEffect(() => {
    if (clip.buffer) {
      if (!waveformCache.has(clip.id, timeline.samplesPerPixel)) {
        throw new Error("no waveform data found");
      }
      const cachedPeaks = waveformCache.get(clip.id, timeline.samplesPerPixel);

      if (cachedPeaks) {
        const normalizedPeaks = normalizePeaks(
          cachedPeaks,
          adjustedHeight,
          waveformMagnificationValue
        );

        const newPeakChunks: Peak[][] = [];
        const totalChunks = Math.ceil(normalizedPeaks.length / maxCanvasWidth);

        for (let i = 0; i < totalChunks; i++) {
          const startSamples = i * maxCanvasWidth;
          const endSamples = Math.min(
            startSamples + maxCanvasWidth,
            normalizedPeaks.length
          );
          const chunk = normalizedPeaks.slice(startSamples, endSamples);
          newPeakChunks.push(chunk);
        }

        setPeakChunks(newPeakChunks);
      }
    }
  }, [
    clip.buffer,
    timeline.samplesPerPixel,
    track.laneHeight,
    clip.length,
    track.color,
    width,
    waveformMagnificationValue,
    adjustedHeight,
    clip.id,
    maxCanvasWidth,
  ]);

  return {
    width,
    height: adjustedHeight,
    peakChunks,
    samplesPerPixel: timeline.samplesPerPixel,
  };
};
