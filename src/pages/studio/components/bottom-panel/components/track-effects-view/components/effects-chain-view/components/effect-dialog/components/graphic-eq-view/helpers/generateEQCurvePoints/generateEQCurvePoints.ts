import { Band } from "@/pages/studio/audio-engine/components/effects/graphic-eq/components";
import { Point } from "../../types";
import * as Tone from "tone";

const MIN_HERTZ = 20;
const MAX_HERTZ = 20000;
const MIN_GAIN_DB = -12;
const MAX_GAIN_DB = 12;
const SAMPLE_RATE = Tone.getContext().sampleRate;

function highpassResponse(
  frequency: number,
  gain: number,
  Q: number,
  testFreq: number
): number {
  if (testFreq <= 0) return MIN_GAIN_DB;

  // Normalize frequencies to [0, π]
  const w0 = 2 * Math.PI * (frequency / SAMPLE_RATE);
  const w = 2 * Math.PI * (testFreq / SAMPLE_RATE);

  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);

  const b0 = (1 + cosW0) / 2;
  const b1 = -(1 + cosW0);
  const b2 = (1 + cosW0) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha;

  const cosW = Math.cos(w);
  const numerator = Math.sqrt(
    Math.pow(b0 + b1 * cosW + b2 * Math.cos(2 * w), 2) +
      Math.pow(b1 * Math.sin(w) + b2 * Math.sin(2 * w), 2)
  );
  const denominator = Math.sqrt(
    Math.pow(a0 + a1 * cosW + a2 * Math.cos(2 * w), 2) +
      Math.pow(a1 * Math.sin(w) + a2 * Math.sin(2 * w), 2)
  );

  let response = 20 * Math.log10(numerator / denominator);

  if (gain > 0) {
    const gainInfluence =
      gain *
      0.3 *
      Math.exp(-4 * Math.pow(Math.log2(testFreq / frequency) - 0.2, 2));
    response += gainInfluence;
  }

  return Math.max(MIN_GAIN_DB, Math.min(MAX_GAIN_DB, response));
}

function peakingResponse(
  frequency: number,
  gain: number,
  Q: number,
  testFreq: number
): number {
  if (testFreq <= 0) return 0;

  const w0 = 2 * Math.PI * (frequency / SAMPLE_RATE);
  const w = 2 * Math.PI * (testFreq / SAMPLE_RATE);

  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);

  const A = Math.pow(10, gain / 40);

  const b0 = 1 + alpha * A;
  const b1 = -2 * cosW0;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha / A;

  const cosW = Math.cos(w);
  const numerator = Math.sqrt(
    Math.pow(b0 + b1 * cosW + b2 * Math.cos(2 * w), 2) +
      Math.pow(b1 * Math.sin(w) + b2 * Math.sin(2 * w), 2)
  );
  const denominator = Math.sqrt(
    Math.pow(a0 + a1 * cosW + a2 * Math.cos(2 * w), 2) +
      Math.pow(a1 * Math.sin(w) + a2 * Math.sin(2 * w), 2)
  );

  return 20 * Math.log10(numerator / denominator);
}

function highShelfResponse(
  frequency: number,
  gain: number,
  Q: number,
  testFreq: number
): number {
  if (testFreq <= 0) return 0;

  const w0 = 2 * Math.PI * (frequency / SAMPLE_RATE);
  const w = 2 * Math.PI * (testFreq / SAMPLE_RATE);

  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);

  const A = Math.pow(10, gain / 40);

  const b0 = A * (A + 1 + (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha);
  const b1 = -2 * A * (A - 1 + (A + 1) * cosW0);
  const b2 = A * (A + 1 + (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha);
  const a0 = A + 1 - (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha;
  const a1 = 2 * (A - 1 - (A + 1) * cosW0);
  const a2 = A + 1 - (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha;

  const cosW = Math.cos(w);
  const numerator = Math.sqrt(
    Math.pow(b0 + b1 * cosW + b2 * Math.cos(2 * w), 2) +
      Math.pow(b1 * Math.sin(w) + b2 * Math.sin(2 * w), 2)
  );
  const denominator = Math.sqrt(
    Math.pow(a0 + a1 * cosW + a2 * Math.cos(2 * w), 2) +
      Math.pow(a1 * Math.sin(w) + a2 * Math.sin(2 * w), 2)
  );

  return 20 * Math.log10(numerator / denominator);
}

function lowpassResponse(
  frequency: number,
  gain: number,
  Q: number,
  testFreq: number
): number {
  if (testFreq <= 0) return 0;

  const w0 = 2 * Math.PI * (frequency / SAMPLE_RATE);
  const w = 2 * Math.PI * (testFreq / SAMPLE_RATE);

  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);

  const b0 = (1 - cosW0) / 2;
  const b1 = 1 - cosW0;
  const b2 = (1 - cosW0) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha;

  const cosW = Math.cos(w);
  const numerator = Math.sqrt(
    Math.pow(b0 + b1 * cosW + b2 * Math.cos(2 * w), 2) +
      Math.pow(b1 * Math.sin(w) + b2 * Math.sin(2 * w), 2)
  );
  const denominator = Math.sqrt(
    Math.pow(a0 + a1 * cosW + a2 * Math.cos(2 * w), 2) +
      Math.pow(a1 * Math.sin(w) + a2 * Math.sin(2 * w), 2)
  );

  let response = 20 * Math.log10(numerator / denominator);

  if (gain > 0) {
    const gainInfluence =
      gain *
      0.3 *
      Math.exp(-4 * Math.pow(Math.log2(testFreq / frequency) + 0.2, 2));
    response += gainInfluence;
  }

  return Math.max(MIN_GAIN_DB, Math.min(MAX_GAIN_DB, response));
}

function lowShelfResponse(
  frequency: number,
  gain: number,
  Q: number,
  testFreq: number
): number {
  if (testFreq <= 0) return 0;

  const w0 = 2 * Math.PI * (frequency / SAMPLE_RATE);
  const w = 2 * Math.PI * (testFreq / SAMPLE_RATE);

  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);

  const A = Math.pow(10, gain / 40);

  const b0 = A * (A + 1 - (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha);
  const b1 = 2 * A * (A - 1 - (A + 1) * cosW0);
  const b2 = A * (A + 1 - (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha);
  const a0 = A + 1 + (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha;
  const a1 = -2 * (A - 1 + (A + 1) * cosW0);
  const a2 = A + 1 + (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha;

  const cosW = Math.cos(w);
  const numerator = Math.sqrt(
    Math.pow(b0 + b1 * cosW + b2 * Math.cos(2 * w), 2) +
      Math.pow(b1 * Math.sin(w) + b2 * Math.sin(2 * w), 2)
  );
  const denominator = Math.sqrt(
    Math.pow(a0 + a1 * cosW + a2 * Math.cos(2 * w), 2) +
      Math.pow(a1 * Math.sin(w) + a2 * Math.sin(2 * w), 2)
  );

  return 20 * Math.log10(numerator / denominator);
}

function notchResponse(
  frequency: number,
  gain: number,
  Q: number,
  testFreq: number
): number {
  if (testFreq <= 0) return 0;

  return -Math.abs(peakingResponse(frequency, -gain, Q, testFreq));
}

function calculateCombinedResponse(bands: Band[], testFreq: number): number {
  let combinedResponse = 0;

  bands.forEach((band) => {
    const { frequency, gain, type, Q } = band;

    let response = 0;
    switch (type) {
      case "highpass":
        response = highpassResponse(frequency, gain, Q, testFreq);
        break;
      case "highshelf":
        response = highShelfResponse(frequency, gain, Q, testFreq);
        break;
      case "peaking":
        response = peakingResponse(frequency, gain, Q, testFreq);
        break;
      case "lowpass":
        response = lowpassResponse(frequency, gain, Q, testFreq);
        break;
      case "lowshelf":
        response = lowShelfResponse(frequency, gain, Q, testFreq);
        break;
      case "notch":
        response = notchResponse(frequency, gain, Q, testFreq);
        break;
      default:
        break;
    }

    combinedResponse += response;
  });

  return Math.max(MIN_GAIN_DB, Math.min(MAX_GAIN_DB, combinedResponse));
}

export function generateEQCurvePoints(
  bands: Band[],
  numPoints: number = 200
): Point[] {
  if (!bands || bands.length === 0) {
    const flatPoints: Point[] = [];
    flatPoints.push({ frequency: MIN_HERTZ, gain: 0, type: "curve" });
    flatPoints.push({ frequency: MAX_HERTZ, gain: 0, type: "curve" });
    return flatPoints;
  }

  const points: Point[] = [];
  const frequencyTolerance = 0.001;

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const frequency = MIN_HERTZ * Math.pow(MAX_HERTZ / MIN_HERTZ, t);
    const gain = calculateCombinedResponse(bands, frequency);

    points.push({ frequency, gain, type: "curve" });
  }

  bands.forEach((band) => {
    const existingPointIndex = points.findIndex(
      (p) => Math.abs(p.frequency / band.frequency - 1) < frequencyTolerance
    );

    if (existingPointIndex === -1) {
      const gain = calculateCombinedResponse(bands, band.frequency);

      const insertIndex = points.findIndex((p) => p.frequency > band.frequency);
      if (insertIndex >= 0) {
        points.splice(insertIndex, 0, {
          frequency: band.frequency,
          gain,
          type: band.type as any,
        });
      } else {
        points.push({
          frequency: band.frequency,
          gain,
          type: band.type as any,
        });
      }
    } else {
      points[existingPointIndex].type = band.type as any;
    }
  });

  const hasMinPoint = points.some(
    (p) => Math.abs(p.frequency - MIN_HERTZ) < frequencyTolerance
  );

  if (!hasMinPoint) {
    points.unshift({
      frequency: MIN_HERTZ,
      gain: calculateCombinedResponse(bands, MIN_HERTZ),
      type: "curve",
    });
  }

  const hasMaxPoint = points.some(
    (p) => Math.abs(p.frequency - MAX_HERTZ) < frequencyTolerance
  );

  if (!hasMaxPoint) {
    points.push({
      frequency: MAX_HERTZ,
      gain: calculateCombinedResponse(bands, MAX_HERTZ),
      type: "curve",
    });
  }
  const startMarker = {
    frequency: MIN_HERTZ,
    gain: 0,
    type: "marker" as any,
  };
  const endMarker = {
    frequency: 30000,
    gain: points[points.length - 1].gain,
    type: "marker" as any,
  };

  const end = {
    frequency: 31000,
    gain: 0,
    type: "marker" as any,
  };

  points.unshift(startMarker);
  points.push(endMarker);
  points.push(end);

  return points.sort((a, b) => a.frequency - b.frequency);
}
