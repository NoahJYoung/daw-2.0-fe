import { Compressor } from "@/pages/studio/audio-engine/components/effects";
import { EffectViewProps } from "../../../../types";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { drawCompressorVisualization } from "./helpers";
import { useAudioEngine } from "@/pages/studio/hooks";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

export const CompressorTopView = observer(
  ({
    track,
    effect: compressor,
    width: topWidth,
    height: topHeight,
  }: EffectViewProps<Compressor>) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const audioEngine = useAudioEngine();

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !topWidth) return;

      canvas.width = topWidth;
      canvas.height = topHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const enabled = ![
        AudioEngineState.stopped,
        AudioEngineState.paused,
      ].includes(audioEngine.state);

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

      // Initial draw, even if not animating
      drawCompressorVisualization(ctx, compressor, topWidth, topHeight, track);

      if (enabled) {
        animate();
      }

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [audioEngine.state, compressor, track, topWidth, topHeight]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !topWidth) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      drawCompressorVisualization(ctx, compressor, topWidth, topHeight, track);
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
      topWidth,
      topHeight,
    ]);

    return topWidth ? (
      <canvas
        ref={canvasRef}
        width={topWidth}
        height={topHeight}
        className="bg-surface-0 rounded-md"
      />
    ) : null;
  }
);
