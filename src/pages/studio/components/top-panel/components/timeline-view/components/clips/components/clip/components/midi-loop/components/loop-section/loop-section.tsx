import { Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";

interface MidiLoopSectionProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  renderLoopSVG: () => React.ReactNode;
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
    renderLoopSVG,
    loopIndex,
    isLooping,
    track,
    clipWidth,
    height,
    clipLeft,
    selected,
    color,
    top,
  }: MidiLoopSectionProps) => {
    const shouldRenderSVG = !track.isResizing && !isLooping;
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
      >
        <span className="flex items-center pl-[2px] pt-[2px] pb-[4px]">
          <p
            style={{ maxWidth: `calc(${clipWidth - 4}px - 1rem )` }}
            className="text-black ml-[2px] mt-[2px] text-xs select-none whitespace-nowrap max-w-full text-ellipsis overflow-hidden"
          >
            Loop
          </p>
        </span>

        {/* {shouldRenderSVG && renderLoopSVG()} */}
      </div>
    );
  }
);
