import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import {
  Peak,
  waveformCache,
} from "@/pages/studio/audio-engine/components/waveform-cache";
import { useAudioEngine } from "@/pages/studio/hooks";
import { useEffect, useRef } from "react";

export function getPeaks(
  channelData: Float32Array,
  samplesPerPixel: number,
  canvasWidth: number
): Peak[] {
  const peaks: Peak[] = [];
  const samplesPerCanvas = canvasWidth * samplesPerPixel; // Total samples displayed in the canvas

  const blockSize = Math.floor(samplesPerCanvas / canvasWidth); // How many samples to average per peak

  for (let i = 0; i < canvasWidth; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length); // Handle the case where the block might go out of bounds

    let min = Infinity;
    let max = -Infinity;

    // Find the min and max values in this block of samples
    for (let j = start; j < end; j++) {
      const value = channelData[j];
      if (value < min) min = value;
      if (value > max) max = value;
    }

    peaks.push({ min, max });
  }

  return peaks;
}

export function normalizePeaks(
  peaks: Peak[],
  height: number,
  scaleFactor: number = 1
): Peak[] {
  const halfHeight = height / 2;
  return peaks.map((peak) => ({
    min: halfHeight + peak.min * halfHeight * scaleFactor,
    max: halfHeight + peak.max * halfHeight * scaleFactor,
  }));
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
      if (i % 2 === 0) {
        const x = i * pixelWidth;
        const peak = peaks[i];
        ctx.moveTo(x, height - peak.min);
        ctx.lineTo(x, height - peak.max);
      }
    }

    ctx.strokeStyle = "black";
    ctx.stroke();
  }
}

export const useWaveform = (clip: AudioClip, track: Track) => {
  const { timeline } = useAudioEngine();
  const width = timeline.samplesToPixels(clip.length);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const adjustedHeight = track.laneHeight - 20;

  const waveformMagnificationValue = Math.min(
    Math.max(adjustedHeight / 15, 5),
    10
  );

  useEffect(() => {
    if (clip.buffer) {
      if (!waveformCache.has(clip.id, timeline.samplesPerPixel)) {
        const peaks = getPeaks(
          clip.buffer.getChannelData(0),
          timeline.samplesPerPixel,
          width
        );
        console.log("not pulling from the cache");
        waveformCache.add(clip.id, peaks, timeline.samplesPerPixel);
      } else {
        console.log("pulling from the cache");
      }

      const cachedPeaks = waveformCache.get(clip.id, timeline.samplesPerPixel);

      if (cachedPeaks) {
        const normalizedPeaks = normalizePeaks(
          cachedPeaks,
          adjustedHeight,
          waveformMagnificationValue
        );
        drawWaveform(normalizedPeaks, canvasRef);
      } else {
        throw new Error("No peaks data found");
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
