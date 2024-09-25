import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import { useWaveform } from "./hooks/use-waveform";
import { drawWaveform } from "./hooks/use-waveform/helpers";
import { observer } from "mobx-react-lite";
import { useLayoutEffect, useRef } from "react";
import { isChunkVisible } from "../../helpers";

interface AudioClipViewProps {
  clip: AudioClip;
  track: Track;
  scrollLeft: number;
  clipLeft: number;
}

export const AudioClipView = observer(
  ({ clip, track, scrollLeft, clipLeft }: AudioClipViewProps) => {
    const { width, height, peakChunks, samplesPerPixel } = useWaveform(
      clip,
      track
    );

    const canvasRefs = useRef<HTMLCanvasElement[]>([]);

    useLayoutEffect(() => {
      for (let i = 0; i < peakChunks.length; i++) {
        const canvas = canvasRefs.current[i];

        if (
          canvas &&
          !track.isResizing &&
          isChunkVisible(peakChunks[i], i, clipLeft, scrollLeft)
        ) {
          drawWaveform(peakChunks[i], canvas);
        }
      }
    }, [
      clip.id,
      clipLeft,
      peakChunks,
      samplesPerPixel,
      scrollLeft,
      track.isResizing,
    ]);

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
            ref={(el) => {
              if (el) {
                canvasRefs.current[i] = el;
              }
            }}
            className="rounded-xl"
            width={chunk.length}
            height={height}
          />
        ))}
      </div>
    );
  }
);
