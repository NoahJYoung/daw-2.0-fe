import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { GraphicEQ } from "@/pages/studio/audio-engine/components/effects";
import { useAudioEngine } from "@/pages/studio/hooks";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

interface FFTVisualizerProps {
  graphicEQ: GraphicEQ;
  width: number;
  height: number;
}

export const FFTVisualizer = observer(
  ({ graphicEQ, width, height }: FFTVisualizerProps) => {
    const animationFrameId = useRef<number>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioEngine = useAudioEngine();

    const scaleY = d3.scaleLinear().domain([-200, 0]).range([height, 0]);
    const scaleX = d3.scaleLog().domain([1, 20000]).range([0, width]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const shouldRun =
        audioEngine.state !== AudioEngineState.paused &&
        audioEngine.state !== AudioEngineState.stopped;

      const drawFFT = () => {
        const fftValues = graphicEQ.fft.getValue();

        if (context && fftValues) {
          context.clearRect(0, 0, width, height);
          context.beginPath();
          context.lineWidth = 1;
          context.strokeStyle = "#888";

          for (let i = 0; i < fftValues.length; i++) {
            const value = fftValues[i];
            const offset = i * 0.24;
            const x = Math.round(scaleX(i * 2)) + offset;
            const y = Math.round(scaleY(value as number));

            if (i === 0) {
              context.moveTo(0, y);
            } else {
              context.lineTo(x, y);
            }
          }

          context.stroke();
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

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          borderRadius: "inherit",
          pointerEvents: "none",
        }}
        width={width}
        height={height}
      />
    );
  }
);
