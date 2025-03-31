import { Track } from "@/pages/studio/audio-engine/components";
import { Compressor } from "@/pages/studio/audio-engine/components/effects";

const padding = 20;
const minDb = -60;
const maxDb = 0;

const dbToY = (db: number, height: number) => {
  return padding + ((maxDb - db) / (maxDb - minDb)) * (height - 2 * padding);
};

const dbToX = (db: number, width: number) => {
  return padding + ((db - minDb) / (maxDb - minDb)) * (width - 2 * padding);
};

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 0.5;

  for (let db = minDb + 20; db <= maxDb; db += 20) {
    const y = dbToY(db, height);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();

    ctx.fillStyle = "#888";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${db}`, db === 0 ? 32 : 40, y + 10);
  }

  for (let db = minDb; db <= maxDb; db += 20) {
    const x = dbToX(db, width);
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();

    ctx.fillStyle = "#888";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`${db}`, db === -60 ? x + 10 : x, height - padding + 5);
  }
};

export const drawAxesLabels = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.fillStyle = "#888";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Input", width / 2, height - 15);

  ctx.save();
  ctx.translate(4, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.font = "12px Arial";
  ctx.fillText("Output", 0, 0);
  ctx.restore();
};

const computeOutputLevel = (inputDb: number, compressor: Compressor) => {
  const { threshold, ratio, knee, makeupGain: gain } = compressor;

  if (inputDb <= threshold - knee / 2) {
    return inputDb;
  }

  if (inputDb >= threshold + knee / 2) {
    return threshold + (inputDb - threshold) / ratio + gain;
  }

  const kneeRange = inputDb - (threshold - knee / 2);
  const kneeStrength = kneeRange / knee;
  const compressionRatio = 1 + (ratio - 1) * kneeStrength;

  // TODO: Look into why the kneeRange * 0.5 is necessary
  return (
    inputDb + kneeRange * 0.5 * (1 / compressionRatio - 1) + gain * kneeStrength
  );
};

export const drawTransferCurve = (
  ctx: CanvasRenderingContext2D,
  compressor: Compressor,
  width: number,
  height: number,
  trackRgb: number[]
) => {
  const [r, g, b] = trackRgb;

  ctx.beginPath();

  ctx.moveTo(dbToX(minDb, width), height - padding);

  for (let inputDb = minDb; inputDb <= maxDb; inputDb += 0.1) {
    const outputDb = computeOutputLevel(inputDb, compressor);
    const x = dbToX(inputDb, width);
    const y = dbToY(outputDb, height);
    ctx.lineTo(x, y);
  }

  ctx.lineTo(dbToX(maxDb, width), height - padding);

  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
  ctx.fill();

  const thresholdX = dbToX(compressor.threshold, width);
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(thresholdX, padding);
  ctx.lineTo(thresholdX, height - padding);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#888";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`T ${compressor.threshold} dB`, thresholdX, padding - 12);
};
export const drawCurrentPoint = (
  ctx: CanvasRenderingContext2D,
  compressor: Compressor,
  width: number,
  height: number
) => {
  const inputLevel = compressor.inputMeter.getValue() as number;
  const clampedInputLevel = Math.max(minDb, Math.min(maxDb, inputLevel));
  const outputLevel = computeOutputLevel(clampedInputLevel, compressor);
  const x = dbToX(clampedInputLevel, width);
  const y = dbToY(outputLevel, height);

  ctx.fillStyle = "#ff9900";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ff9900";
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(x, y);
  ctx.moveTo(x, height - padding);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.setLineDash([]);

  const reduction = compressor.reduction;

  ctx.fillStyle = "#ff3333";
  ctx.font = "10px Arial";
  ctx.textAlign = "left";
  if (reduction <= -0.1) {
    ctx.fillText(`${reduction.toFixed(1)} dB`, padding + 10, padding + 10);
  }
};

export const drawCompressorVisualization = (
  ctx: CanvasRenderingContext2D,
  compressor: Compressor,
  width: number,
  height: number,
  track: Track
) => {
  ctx.clearRect(0, 0, width, height);

  drawGrid(ctx, width, height);
  drawAxesLabels(ctx, width, height);
  drawTransferCurve(ctx, compressor, width, height, track.rgb);
  drawCurrentPoint(ctx, compressor, width, height);
};
