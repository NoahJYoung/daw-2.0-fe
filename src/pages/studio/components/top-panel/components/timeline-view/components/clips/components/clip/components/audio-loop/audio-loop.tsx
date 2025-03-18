import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { useWaveform } from "../audio-clip-view/hooks/use-waveform";
import { LoopSection } from "./components";

interface AudioLoopProps {
  clip: AudioClip;
  track: Track;
  color: string;
  top: number;
  selected: boolean;
  clipLeft: number;
  isLooping: boolean;
  scrollLeft: number;
  loopOffset: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const AudioLoop = observer(
  ({
    clip,
    track,
    color,
    top,
    clipLeft,
    selected,
    isLooping,
    loopOffset,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onMouseDown,
  }: AudioLoopProps) => {
    const {
      width: clipWidth,
      height,
      peakChunks,
      loopWidth,
    } = useWaveform(clip, track, { loop: true, loopOffset, selected });

    const canvasRefs = useRef<HTMLCanvasElement[][]>([]);

    const loops = Array.from({
      length: Math.floor(
        (clip.loopSamples + (selected ? loopOffset : 0)) / clip.length
      ),
    });

    if (!canvasRefs.current.length) {
      canvasRefs.current = loops.map(() => []);
    }

    const transformX = clipLeft + clipWidth + clipWidth * loops.length;

    return (
      <div
        onClick={onClick}
        onMouseDown={onMouseDown}
        className="flex flex-shrink-0 bg-transparent"
      >
        {loops.map((_, i) => (
          <LoopSection
            isLooping={isLooping}
            loopIndex={i}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            clipWidth={clipWidth}
            height={height}
            selected={selected}
            clipLeft={clipLeft}
            top={top}
            peakChunks={peakChunks}
            color={color}
            canvasRefs={canvasRefs}
            clip={clip}
            key={i}
          />
        ))}
        <div
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="h-full flex flex-col flex-shrink-0 rounded-xl absolute overflow-hidden"
          style={{
            width: loopWidth - clipWidth * loops.length,
            height: height + 28,
            transform: `translate(${transformX}px, ${top}px)`,
            marginTop: 2,
            opacity: selected ? 0.4 : 0.3,
            background: color,
            willChange: "transform",
          }}
        />
      </div>
    );
  }
);
