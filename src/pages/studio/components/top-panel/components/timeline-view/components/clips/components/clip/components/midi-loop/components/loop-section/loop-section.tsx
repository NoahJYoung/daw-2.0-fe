import { MidiClip, Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import {
  getNoteWidth,
  getNoteXPosition,
  getNoteYPosition,
} from "../../../../helpers";

interface MidiLoopSectionProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  clipWidth: number;
  height: number;
  clipLeft: number;
  loopIndex: number;
  top: number;
  clip: MidiClip;
  track: Track;
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
    track,
    selected,
    color,
    top,
    clip,
  }: MidiLoopSectionProps) => {
    const { timeline } = useAudioEngine();
    const noteHeight = (track!.laneHeight - 36) / 12;

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

        <svg
          width={timeline.samplesToPixels(clip.length)}
          height={track!.laneHeight - 30}
          className="mb-[6px]"
        >
          <g>
            {clip.events.map((event) => (
              <rect
                key={event.id}
                fill="black"
                height={noteHeight}
                width={getNoteWidth(event, timeline)}
                x={getNoteXPosition(event, timeline)}
                rx="2px"
                y={getNoteYPosition(event, noteHeight)}
              />
            ))}
          </g>
        </svg>
      </div>
    );
  }
);
