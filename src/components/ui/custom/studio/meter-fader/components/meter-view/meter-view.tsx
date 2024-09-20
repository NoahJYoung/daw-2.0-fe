import * as Tone from "tone";
import { useEffect, useRef, useState } from "react";
import { useRequestAnimationFrame } from "@/pages/studio/hooks";

const drawMeter = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  height: number,
  width: number,
  meterValue: number
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  // We assume meterValue is in dB, where 0 is the max and -60 is a common lower bound
  const minDb = -100;
  const maxDb = 0;

  // Clamp the meterValue to the min/max range to avoid drawing outside the canvas
  const clampedValue = Math.max(minDb, Math.min(meterValue, maxDb));

  // Normalize the dB value to a 0-1 range
  const normalizedValue = (clampedValue - minDb) / (maxDb - minDb);

  // Calculate the bar height based on the normalized value
  const barHeight = height * (1 - normalizedValue);

  // Detect clipping (when the meter value reaches 0 dB or higher)
  const isClipping = meterValue >= 0;

  // Set fill color (red if clipping, green otherwise)
  ctx.fillStyle = isClipping ? "red" : "green";

  // Draw the bar
  ctx.fillRect(0, barHeight, width, height - barHeight);
};

interface MeterViewProps {
  meter: Tone.Meter;
  height: number;
  width: number;
  stopDelayMs?: number;
  active?: boolean;
  label?: string;
}

export const MeterView = ({
  label,
  meter,
  height,
  width,
  active,
  stopDelayMs = 0,
}: MeterViewProps) => {
  const [enabled, setEnabled] = useState(active);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useRequestAnimationFrame(
    () => {
      const meterValue = meter.getValue();
      if (!Array.isArray(meterValue)) {
        drawMeter(canvasRef, height, width, meterValue);
      }
    },
    {
      enabled,
    }
  );

  useEffect(() => {
    setTimeout(() => setEnabled(active), enabled ? stopDelayMs : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stopDelayMs]);

  return (
    <div style={{ height, width: width, border: "1px solid black" }}>
      <canvas height={height} width={width} ref={canvasRef} />
    </div>
  );
};
