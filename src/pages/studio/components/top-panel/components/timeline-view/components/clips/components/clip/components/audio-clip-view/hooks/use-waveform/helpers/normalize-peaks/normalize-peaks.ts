import { Peak } from "@/pages/studio/audio-engine/components/waveform-cache";

export function normalizePeaks(
  peaks: Peak[],
  height: number,
  scaleFactor: number = 2,
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
