import { AudioClip } from "@/pages/studio/audio-engine/components";
import { Peak } from "@/pages/studio/audio-engine/components/waveform-cache";
import { MutableRefObject } from "react";

interface LoopSectionProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isLooping: boolean;
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
}: LoopSectionProps) => (
  <div
    key={`loop-${loopIndex}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className="h-full flex flex-col flex-shrink-0 rounded-xl absolute overflow-hidden"
    style={{
      width: clipWidth,
      height,
      left: clipLeft + clipWidth * (loopIndex + 1),
      marginTop: 2,
      opacity: selected ? 0.4 : 0.3,
      background: color,
      top,
    }}
  />
);
