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
    // scrollLeft,
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
      // samplesPerPixel,
      loopWidth,
    } = useWaveform(clip, track, { loop: true, loopOffset, selected });

    const canvasRefs = useRef<HTMLCanvasElement[][]>([]);
    const lastLoopRefs = useRef<HTMLCanvasElement[]>([]);

    const loops = Array.from({
      length: Math.floor(
        (clip.loopSamples + (selected ? loopOffset : 0)) / clip.length
      ),
    });

    if (!canvasRefs.current.length) {
      canvasRefs.current = loops.map(() => []);
    }

    // useLayoutEffect(() => {
    //   peakChunks.forEach((chunk, i) => {
    //     loops.forEach((_, loopIndex) => {
    //       const canvas = canvasRefs.current[loopIndex][i];
    //       const loopLeft = clipLeft + clipWidth * (loopIndex + 1);

    //     //   if (
    //     //     canvas &&
    //     //     !track.isResizing &&
    //     //     isChunkVisible(chunk, i, loopLeft, scrollLeft)
    //     //   ) {
    //     //     drawWaveform(chunk, canvas);
    //     //   }
    //     // });

    //     const lastCanvas = lastLoopRefs.current[i];
    //     const lastLoopLeft = clipLeft + clipWidth + clipWidth * loops.length;

    //     // if (
    //     //   lastCanvas &&
    //     //   !track.isResizing &&
    //     //   isChunkVisible(chunk, i, lastLoopLeft, scrollLeft)
    //     // ) {
    //     //   drawWaveform(chunk, lastCanvas);
    //     // }
    //   });
    // }, [
    //   clip.id,
    //   clipLeft,
    //   peakChunks,
    //   samplesPerPixel,
    //   track.isResizing,
    //   isLooping,
    //   loops.length,
    //   loops,
    //   scrollLeft,
    //   clipWidth,
    //   loopOffset,
    // ]);

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
            left: clipLeft + clipWidth + clipWidth * loops.length,
            marginTop: 2,
            opacity: selected ? 0.4 : 0.3,
            background: color,
            top,
          }}
        >
          <span className="flex items-center pl-[2px] pt-[2px] pb-[4px]">
            <p
              style={{ maxWidth: `calc(${clipWidth - 4}px - 1rem )` }}
              className="text-black ml-[2px] mt-[2px] text-xs select-none whitespace-nowrap max-w-full text-ellipsis overflow-hidden"
            >
              Loop
            </p>
          </span>
          <div className="flex">
            {!isLooping &&
              peakChunks.map((chunk, i) => (
                <canvas
                  key={`loop-${clip.id}-${i}-last`}
                  ref={(el) => {
                    if (el) {
                      lastLoopRefs.current[i] = el;
                    }
                  }}
                  className="rounded-xl"
                  width={chunk.length}
                  height={height}
                />
              ))}
          </div>
        </div>
      </div>
    );
  }
);
