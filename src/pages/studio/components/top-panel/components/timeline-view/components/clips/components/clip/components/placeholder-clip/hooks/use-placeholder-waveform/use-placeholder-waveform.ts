import { Track } from "@/pages/studio/audio-engine/components";
import { getPeaks } from "@/pages/studio/audio-engine/components/audio-buffer-cache/helpers";
import { useAudioEngine } from "@/pages/studio/hooks";
import { useLayoutEffect, useRef, useState } from "react";
import {
  drawWaveform,
  normalizePeaks,
} from "../../../audio-clip-view/hooks/use-waveform/helpers";

export const usePlaceholderWaveform = (track: Track) => {
  const { timeline } = useAudioEngine();

  const [waveformData, setWaveformData] = useState<Float32Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const adjustedHeight = track.laneHeight - 30;

  const waveformMagnificationValue = 1;

  useLayoutEffect(() => {
    if (waveformData) {
      const peaks = getPeaks(waveformData, timeline.samplesPerPixel);
      const normalizedPeaks = normalizePeaks(
        peaks,
        adjustedHeight,
        waveformMagnificationValue
      );
      requestAnimationFrame(() => {
        if (track.input === "mic" && canvasRef.current) {
          drawWaveform(normalizedPeaks, canvasRef.current);
        }
      });
    }
  }, [adjustedHeight, timeline.samplesPerPixel, track.input, waveformData]);

  return { canvasRef, height: adjustedHeight, setWaveformData, waveformData };
};
