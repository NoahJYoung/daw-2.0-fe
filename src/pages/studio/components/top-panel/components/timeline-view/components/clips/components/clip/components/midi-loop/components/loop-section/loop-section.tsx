import { Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";

interface MidiLoopSectionProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  clipWidth: number;
  height: number;
  clipLeft: number;
  loopIndex: number;
  top: number;
  track: Track;
  isLooping: boolean;
  selected: boolean;
  color: string;
}

export const LoopSection = observer(
  ({
    onMouseEnter,
    onMouseLeave,
    loopIndex,
    clipWidth,
    height,
    clipLeft,
    selected,
    color,
    top,
  }: MidiLoopSectionProps) => {
    return (
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
          opacity: selected ? 0.4 : 0.3,
          background: color,
          top,
        }}
      />
    );
  }
);
