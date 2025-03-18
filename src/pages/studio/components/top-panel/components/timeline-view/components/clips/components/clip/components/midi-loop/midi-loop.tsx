import { MidiClip, Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import React from "react";
import { LoopSection } from "./components";
import { useAudioEngine } from "@/pages/studio/hooks";

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
    isLooping,
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

    // Calculate transform values for the last section
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
