import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import { waveformCache } from "@/pages/studio/audio-engine/components/waveform-cache";
import { useAudioEngine } from "@/pages/studio/hooks";
import { useEffect, useRef } from "react";
import { drawWaveform, normalizePeaks } from "./helpers";

export const useWaveform = (clip: AudioClip, track: Track) => {
  const { timeline } = useAudioEngine();
  const width = timeline.samplesToPixels(clip.length);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const adjustedHeight = track.laneHeight - 30;

  const waveformMagnificationValue = 1;

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
        drawWaveform(normalizedPeaks, canvasRef);
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
  ]);

  return { canvasRef, width, height: adjustedHeight };
};
