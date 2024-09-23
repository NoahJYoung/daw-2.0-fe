import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import { useWaveform } from "./hooks/use-waveform";
import { drawWaveform } from "./hooks/use-waveform/helpers";

import { observer } from "mobx-react-lite";
import { useEffect } from "react";

interface AudioClipViewProps {
  clip: AudioClip;
  track: Track;
}

export const AudioClipView = observer(({ clip, track }: AudioClipViewProps) => {
  const { width, height, peakChunks, samplesPerPixel } = useWaveform(
    clip,
    track
  );

  useEffect(() => {
    for (let i = 0; i < peakChunks.length; i++) {
      const canvas = document.getElementById(
        `${clip.id}-${i}`
      ) as HTMLCanvasElement | null;

      if (canvas) {
        drawWaveform(peakChunks[i], canvas);
      }
    }
  }, [clip.id, peakChunks, samplesPerPixel]);

  return (
    <div
      className="h-full flex flex-shrink-0"
      style={{
        width,
        height,
      }}
    >
      {peakChunks.map((chunk, i) => (
        <canvas
          key={`${clip.id}-${i}`}
          id={`${clip.id}-${i}`}
          className="rounded-xl"
          width={chunk.length}
          height={height}
        />
      ))}
    </div>
  );
});
