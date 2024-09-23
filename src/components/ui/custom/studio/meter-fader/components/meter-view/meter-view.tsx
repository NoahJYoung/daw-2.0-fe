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

  const minDb = -100;
  const maxDb = 0;

  const clampedValue = Math.max(minDb, Math.min(meterValue, maxDb));

  const normalizedValue = (clampedValue - minDb) / (maxDb - minDb);

  const barHeight = height * (1 - normalizedValue);

  const isClipping = meterValue >= 0;

  ctx.fillStyle = isClipping
    ? "rgba(227, 18, 18, 0.75)"
    : "rgba(18, 227, 67, 0.75)";

  ctx.fillRect(0, barHeight, width, height - barHeight);
};

interface MeterViewProps {
  meter: Tone.Meter;
  height: number;
  width: number;
  stopDelayMs?: number;
  active?: boolean;
}

export const MeterView = ({
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
    <div
      style={{ width, height }}
      className="bg-surface-1 h-full border border-surface-4"
    >
      <canvas width={width - 2} height={height} ref={canvasRef} />
    </div>
  );
};
