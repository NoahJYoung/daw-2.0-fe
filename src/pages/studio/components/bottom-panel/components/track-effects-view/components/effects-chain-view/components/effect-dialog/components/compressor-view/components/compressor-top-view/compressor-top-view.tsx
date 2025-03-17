import { Compressor } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewProps } from "../../../../types";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { topHeight, topWidth } from "../../../../helpers";
import { drawCompressorVisualization } from "./helpers";
import { useAudioEngine } from "@/pages/studio/hooks";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

export const CompressorTopView = observer(
  ({ track, effect: compressor }: EffectViewProps<Compressor>) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    const audioEngine = useAudioEngine();

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const enabled = ![
        AudioEngineState.stopped,
        AudioEngineState.paused,
      ].includes(audioEngine.state);

      if (!ctx) {
        return;
      }

      const animate = () => {
        ctx.clearRect(0, 0, topWidth, topHeight);

        drawCompressorVisualization(
          ctx,
          compressor,
          topWidth,
          topHeight,
          track
        );

        animationRef.current = requestAnimationFrame(animate);
      };

      if (enabled) {
        animate();
      }

      drawCompressorVisualization(ctx, compressor, topWidth, topHeight, track);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [audioEngine.state, compressor, track]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        drawCompressorVisualization(
          ctx,
          compressor,
          topWidth,
          topHeight,
          track
        );
      }
    }, [
      compressor.attack,
      compressor.release,
      compressor.threshold,
      compressor.ratio,
      compressor.knee,
      compressor.makeupGain,
      track.rgb,
      compressor,
      track,
    ]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        drawCompressorVisualization(
          ctx,
          compressor,
          topWidth,
          topHeight,
          track
        );
      }
    }, [audioEngine.state, compressor, track]);

    return (
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={topWidth}
          height={topHeight}
          className="bg-surface-0 rounded-md"
        />
      </div>
    );
  }
);
