import * as Tone from "tone";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAudioEngine, useRequestAnimationFrame } from "@/pages/studio/hooks";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useThemeContext } from "@/hooks";

const drawMeter = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  height: number,
  width: number,
  meterValue: number,
  peakValue: number,
  peakColor: string
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  const minDb = -60;
  const maxDb = 12;

  const clampedValue = Math.max(minDb, Math.min(meterValue, maxDb));
  const clampedPeak = Math.max(minDb, Math.min(peakValue, maxDb));

  const normalizedValue = (clampedValue - minDb) / (maxDb - minDb);
  const normalizedPeak = (clampedPeak - minDb) / (maxDb - minDb);

  const barHeight = height * (1 - normalizedValue);
  const peakHeight = height * (1 - normalizedPeak);

  let barColor;
  if (meterValue >= 0) {
    const intensity = Math.min(1, meterValue / maxDb);
    const red = 227;
    const green = Math.round(227 * (1 - intensity));
    const blue = 18;
    barColor = `rgba(${red}, ${green}, ${blue}, 0.75)`;
  } else if (meterValue >= -18) {
    const intensity = (meterValue + 18) / 18;
    const red = Math.round(18 + 209 * intensity);
    const green = 227;
    const blue = 18;
    barColor = `rgba(${red}, ${green}, ${blue}, 0.5)`;
  } else {
    barColor = "rgba(18, 227, 67, 0.5)";
  }

  ctx.fillStyle = barColor;
  ctx.fillRect(0, barHeight, width, height - barHeight);

  if (peakHeight < height) {
    ctx.fillStyle = peakValue >= 0 ? "rgba(227, 18, 18, 1)" : peakColor;
    ctx.fillRect(0, peakHeight, width, 2);
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, barHeight, width, height - barHeight);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 1;

  const dbPoints = [0, -6, -12, -18, -24, -36, -48];
  dbPoints.forEach((db) => {
    if (db >= minDb && db <= maxDb) {
      const normalizedDb = (db - minDb) / (maxDb - minDb);
      const yPos = height * (1 - normalizedDb);
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(width, yPos);
      ctx.stroke();
    }
  });
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
  stopDelayMs = 1000,
}: MeterViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioEngine = useAudioEngine();
  const { theme } = useThemeContext();
  const [peak, setPeak] = useState<number>(-Infinity);
  const peakTimeoutRef = useRef<number | null>(null);
  const lastMeterValueRef = useRef<number>(-Infinity);

  const peakColor = useMemo(
    () =>
      theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
    [theme]
  );

  const resetPeakAfterDelay = () => {
    if (peakTimeoutRef.current) {
      window.clearTimeout(peakTimeoutRef.current);
    }

    peakTimeoutRef.current = window.setTimeout(() => {
      setPeak(-Infinity);
      peakTimeoutRef.current = null;
    }, stopDelayMs);
  };

  useRequestAnimationFrame(
    () => {
      if (!active) return;

      let meterValue = meter.getValue();

      if (Array.isArray(meterValue)) {
        meterValue = Math.max(
          ...meterValue.filter((v) => typeof v === "number")
        );
      }

      const smoothingFactor = 0.7;
      const smoothedValue =
        lastMeterValueRef.current !== -Infinity
          ? lastMeterValueRef.current * smoothingFactor +
            meterValue * (1 - smoothingFactor)
          : meterValue;

      lastMeterValueRef.current = smoothedValue;

      if (smoothedValue > peak) {
        setPeak(smoothedValue);
        resetPeakAfterDelay();
      }

      drawMeter(canvasRef, height, width, smoothedValue, peak, peakColor);
    },
    {
      enabled: active,
    }
  );

  useEffect(() => {
    return () => {
      if (peakTimeoutRef.current) {
        window.clearTimeout(peakTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if ([AudioEngineState.stopped].includes(audioEngine.state)) {
      canvasRef.current?.getContext("2d")?.clearRect(0, 0, width, height);
      lastMeterValueRef.current = -Infinity;
      setPeak(-Infinity);
    }
  }, [audioEngine.state, height, width]);

  return (
    <div
      style={{ width, height }}
      className="bg-surface-1 h-full border border-surface-4"
    >
      <canvas width={width - 2} height={height} ref={canvasRef} />
    </div>
  );
};
