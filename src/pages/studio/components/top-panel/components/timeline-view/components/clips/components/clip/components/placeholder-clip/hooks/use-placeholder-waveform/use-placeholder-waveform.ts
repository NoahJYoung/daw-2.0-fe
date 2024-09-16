import { Track } from "@/pages/studio/audio-engine/components";
import { getPeaks } from "@/pages/studio/audio-engine/components/audio-buffer-cache/helpers";
import { Peak } from "@/pages/studio/audio-engine/components/waveform-cache";
import { useAudioEngine } from "@/pages/studio/hooks";
import { useEffect, useRef, useState } from "react";

export function normalizePeaks(
  peaks: Peak[],
  height: number,
  scaleFactor: number = 1,
  minBarHeight: number = 1
): Peak[] {
  const halfHeight = height / 2;
  return peaks.map((peak) => {
    const adjustedMin = peak.min * halfHeight * scaleFactor;
    const adjustedMax = peak.max * halfHeight * scaleFactor;

    const minPeak = Math.min(adjustedMin, -minBarHeight);
    const maxPeak = Math.max(adjustedMax, minBarHeight);

    return {
      min: halfHeight + minPeak,
      max: halfHeight + maxPeak,
    };
  });
}

export function drawWaveform(
  peaks: Peak[],
  canvasRef: React.RefObject<HTMLCanvasElement>
): void {
  const canvas = canvasRef.current;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    const pixelWidth = width / peaks.length;

    for (let i = 0; i < peaks.length; i++) {
      const x = i * pixelWidth;
      const peak = peaks[i];
      ctx.moveTo(x, height - peak.min);
      ctx.lineTo(x, height - peak.max);
    }

    ctx.strokeStyle = "black";
    ctx.stroke();
  }
}

export const usePlaceholderWaveform = (track: Track) => {
  const { timeline } = useAudioEngine();

  const [waveformData, setWaveformData] = useState<Float32Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const adjustedHeight = track.laneHeight - 30;

  const waveformMagnificationValue = 4;

  useEffect(() => {
    if (waveformData) {
      const peaks = getPeaks(waveformData, timeline.samplesPerPixel);
      const normalizedPeaks = normalizePeaks(
        peaks,
        adjustedHeight,
        waveformMagnificationValue
      );
      requestAnimationFrame(() => drawWaveform(normalizedPeaks, canvasRef));
    }
  }, [adjustedHeight, timeline.samplesPerPixel, waveformData]);

  return { canvasRef, height: adjustedHeight, setWaveformData, waveformData };
};
