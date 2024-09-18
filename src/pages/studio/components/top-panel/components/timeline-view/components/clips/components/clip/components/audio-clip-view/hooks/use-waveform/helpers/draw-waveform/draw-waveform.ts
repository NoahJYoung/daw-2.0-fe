import { Peak } from "@/pages/studio/audio-engine/components/waveform-cache";

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

    ctx.strokeStyle = "rgba(50, 05, 50, 0.8)";
    ctx.stroke();
  }
}
