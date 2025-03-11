import { Peak } from "@/pages/studio/audio-engine/components/waveform-cache";

export type WaveformData = Peak[];

export type WaveformDataBySamples = Record<number, Peak[]>;

export function drawWaveform(peaks: Peak[], canvas: HTMLCanvasElement): void {
  if (!canvas || !peaks.length) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(50, 50, 50, 0.8)";
  ctx.lineWidth = 1;

  const pixelWidth = width / peaks.length;

  if (pixelWidth >= 2) {
    ctx.beginPath();
    for (let i = 0; i < peaks.length; i++) {
      const x = Math.floor(i * pixelWidth) + 0.5;
      const peak = peaks[i];

      ctx.moveTo(x, height - peak.min);
      ctx.lineTo(x, height - peak.max);
    }
    ctx.stroke();
  } else {
    ctx.beginPath();

    let x = 0;
    ctx.moveTo(x, height - peaks[0].min);

    for (let i = 1; i < peaks.length; i++) {
      x = i * pixelWidth;
      ctx.lineTo(x, height - peaks[i].min);
    }

    for (let i = peaks.length - 1; i >= 0; i--) {
      x = i * pixelWidth;
      ctx.lineTo(x, height - peaks[i].max);
    }

    ctx.lineTo(0, height - peaks[0].min);

    ctx.fillStyle = "rgba(50, 50, 50, 0.8)";
    ctx.fill();
  }
}
