import { MidiClip, Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import React from "react";
import { LoopSection } from "./components";
import { useAudioEngine } from "@/pages/studio/hooks";
import {
  getNoteWidth,
  getNoteXPosition,
  getNoteYPosition,
} from "../../helpers";

interface MidiLoopProps {
  clip: MidiClip;
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

export const MidiLoop = observer(
  ({
    clip,
    track,
    color,
    top,
    clipLeft,
    selected,
    // isLooping,
    // scrollLeft,
    loopOffset,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onMouseDown,
  }: MidiLoopProps) => {
    const { timeline } = useAudioEngine();
    const loops = Array.from({
      length: Math.floor(
        (clip.loopSamples + (selected ? loopOffset : 0)) / clip.length
      ),
    });

    const getLoopWidth = () => {
      if (selected) {
        const loopWidth =
          clip.loopSamples + loopOffset > 0
            ? (clip.loopSamples + loopOffset) / timeline.samplesPerPixel
            : 0;

        return loopWidth;
      }

      const loopWidth =
        clip.loopSamples > 0 ? clip.loopSamples / timeline.samplesPerPixel : 0;

      return loopWidth;
    };

    const clipWidth = timeline.samplesToPixels(clip.length);

    const height = track.laneHeight - 30;

    const loopWidth = getLoopWidth();

    const noteHeight = (track!.laneHeight - 36) / 12;

    return (
      <div
        onClick={onClick}
        onMouseDown={onMouseDown}
        className="flex flex-shrink-0 bg-transparent"
      >
        {loops.map((_, i) => (
          <LoopSection
            track={track}
            loopIndex={i}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            clipWidth={clipWidth}
            height={height}
            selected={selected}
            clipLeft={clipLeft}
            top={top}
            color={color}
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
      </div>
    );
  }
);
