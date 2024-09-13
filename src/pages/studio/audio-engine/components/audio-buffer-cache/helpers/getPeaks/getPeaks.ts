import { Peak } from "../../../waveform-cache";

export function getPeaks(
  channelData: Float32Array,
  samplesPerPixel: number
): Peak[] {
  const peaks: Peak[] = [];
  const samplesPerCanvas = channelData.length;
  const canvasWidth = channelData.length / samplesPerPixel;

  const blockSize = Math.floor(samplesPerCanvas / canvasWidth);

  for (let i = 0; i < canvasWidth; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);

    let min = Infinity;
    let max = -Infinity;

    for (let j = start; j < end; j++) {
      const value = channelData[j];
      if (value < min) min = value;
      if (value > max) max = value;
    }

    peaks.push({ min, max });
  }

  return peaks;
}
