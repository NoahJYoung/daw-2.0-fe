import * as Tone from "tone";
import { useEffect, useRef } from "react";
import { useAudioEngine, useRequestAnimationFrame } from "@/pages/studio/hooks";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

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
    : "rgba(18, 227, 67, 0.5)";

  ctx.fillRect(0, barHeight, width, height - barHeight);
};

interface MeterViewProps {
  meter: Tone.Meter;
  height: number;
  width: number;
  stopDelayMs?: number;
  active?: boolean;
}

export const MonoMeterView = ({
  meter,
  height,
  width,
  active,
}: MeterViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioEngine = useAudioEngine();

  useRequestAnimationFrame(
    () => {
      const meterValue = meter.getValue();
      if (!Array.isArray(meterValue)) {
        drawMeter(canvasRef, height, width, meterValue);
      }
    },
    {
      enabled: active,
    }
  );

  useEffect(() => {
    if ([AudioEngineState.stopped].includes(audioEngine.state)) {
      canvasRef.current?.getContext("2d")?.clearRect(0, 0, width, height);
    }
  }, [audioEngine.state, height, width]);

  return (
    <div
      style={{ width, height }}
      className="bg-surface-1 h-full border absolute border-surface-4"
    >
      <canvas width={width - 2} height={height} ref={canvasRef} />
    </div>
  );
};
