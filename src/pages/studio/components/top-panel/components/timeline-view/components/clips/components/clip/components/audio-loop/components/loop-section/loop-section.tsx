import { AudioClip } from "@/pages/studio/audio-engine/components";
import { Peak } from "@/pages/studio/audio-engine/components/waveform-cache";
import { MutableRefObject } from "react";

interface LoopSectionProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  clipWidth: number;
  height: number;
  clipLeft: number;
  loopIndex: number;
  top: number;
  peakChunks: Peak[][];
  clip: AudioClip;
  selected: boolean;
  color: string;
  canvasRefs: MutableRefObject<HTMLCanvasElement[][]>;
}

export const LoopSection = ({
  onMouseEnter,
  onMouseLeave,
  loopIndex,
  clipWidth,
  height,
  clipLeft,
  selected,
  color,
  top,
  peakChunks,
  clip,
  canvasRefs,
}: LoopSectionProps) => (
  <div
    key={`loop-${loopIndex}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className="h-full flex flex-col flex-shrink-0 rounded-xl absolute overflow-hidden"
    style={{
      width: clipWidth,
      height: height + 28,
      left: clipLeft + clipWidth * (loopIndex + 1),
      marginTop: 2,
      opacity: selected ? 0.5 : 0.4,
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
      {peakChunks.map((chunk, j) => (
        <canvas
          key={`loop-${clip.id}-${j}-${loopIndex}`}
          ref={(el) => {
            if (el) {
              if (!canvasRefs.current[loopIndex]) {
                canvasRefs.current[loopIndex] = [];
              }
              canvasRefs.current[loopIndex][j] = el;
            }
          }}
          className="rounded-xl"
          width={chunk.length}
          height={height}
        />
      ))}
    </div>
  </div>
);
