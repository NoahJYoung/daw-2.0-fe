import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphicEQ } from "@/pages/studio/audio-engine/components/effects";
import { useAudioEngine } from "@/pages/studio/hooks";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import * as Tone from "tone";

interface FFTVisualizerProps {
  graphicEQ: GraphicEQ;
  width: number;
  height: number;
}

const MIN_HERTZ = 20;
const MAX_HERTZ = 20000;
const MIN_DB = -120;
const MAX_DB = -30;

export const FFTVisualizer = observer(
  ({ graphicEQ, width, height }: FFTVisualizerProps) => {
    const animationFrameId = useRef<number>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioEngine = useAudioEngine();

    const scaleY = d3.scaleLinear().domain([MIN_DB, MAX_DB]).range([height, 0]);
    const scaleX = d3
      .scaleLog()
      .domain([MIN_HERTZ, MAX_HERTZ])
      .range([0, width]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const shouldRun =
        audioEngine.state !== AudioEngineState.paused &&
        audioEngine.state !== AudioEngineState.stopped;
      const drawFFT = () => {
        const fftValues = graphicEQ.fft.getValue();
        if (context && fftValues) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          const width = canvas.width;
          const height = canvas.height;

          if (!ctx) {
            return;
          }

          ctx.clearRect(0, 0, width, height);

          const binCount = fftValues.length;
          const sampleRate = Tone.getContext().sampleRate;

          ctx.beginPath();

          const x0 = scaleX(MIN_HERTZ);

          const minHertzBin = Math.round(
            (MIN_HERTZ * binCount) / (sampleRate / 2)
          );
          const firstValue = fftValues[minHertzBin] as number;

          const firstBoost = Math.min(18, 6 * Math.log10(MIN_HERTZ / 100 + 1));
          const y0 = scaleY(firstValue + firstBoost);

          ctx.moveTo(x0, y0);

          let x = x0;
          let y = y0;

          for (let i = minHertzBin + 1; i < binCount; i++) {
            const freq = (i * (sampleRate / 2)) / binCount;
            if (freq > MAX_HERTZ) break;

            const rawValue = fftValues[i] as number;

            const nextX = scaleX(freq);
            const nextY = scaleY(rawValue);

            const cpX1 = x + (nextX - x) / 2;
            const cpX2 = x + (nextX - x) / 2;

            ctx.bezierCurveTo(cpX1, y, cpX2, nextY, nextX, nextY);

            x = nextX;
            y = nextY;
          }

          ctx.lineTo(width, height);
          ctx.lineTo(x0, height);
          ctx.closePath();

          ctx.fillStyle = "rgba(175, 175, 175, 0.2)";
          ctx.fill();
        }

        if (shouldRun) {
          animationFrameId.current = requestAnimationFrame(drawFFT);
        }
      };
      if (shouldRun) drawFFT();

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, [graphicEQ.fft, audioEngine.state, width, height, scaleX, scaleY]);

    useEffect(() => {
      if ([AudioEngineState.stopped].includes(audioEngine.state)) {
        canvasRef.current?.getContext("2d")?.clearRect(0, 0, width, height);
      }
    }, [audioEngine.state, height, width]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          borderRadius: "inherit",
          pointerEvents: "none",
          marginLeft: 20,
        }}
        width={width}
        height={height}
      />
    );
  }
);
