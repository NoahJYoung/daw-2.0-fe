import { cn } from "@/lib/utils";
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";

const renderGridLanes = (
  width: number,
  laneHeight: number,
  numKeys: number
) => {
  const isBlackKey = (index: number) => {
    const octavePosition = index % 12;
    return [1, 3, 5, 8, 10].includes(octavePosition);
  };

  const isLastKey = (index: number) => {
    return index === numKeys - 1;
  };

  const getRectHeight = (index: number) => {
    if (isBlackKey(index)) {
      return laneHeight - 1;
    }
    if (isLastKey(index)) {
      return laneHeight + 1;
    }

    return laneHeight;
  };

  return Array.from({ length: numKeys }).map((_, i) => (
    <>
      <rect
        x={0}
        y={i * laneHeight - 1}
        height={getRectHeight(i)}
        width={width}
        className={cn(
          "fill-current opacity-20",
          isBlackKey(i) ? "text-zinc-600" : "text-zinc-400"
        )}
      />
      <line
        x1={0}
        x2={width}
        y1={i * laneHeight - 1}
        y2={i * laneHeight - 1}
        className="stroke-current stroke-surface-2"
        strokeWidth={1}
      />
    </>
  ));
};

interface PianoRollTimelineProps {
  clip: MidiClip;
  keys: PitchNameTuple[];
}
export const PianoRollTimeline = observer(
  ({ clip, keys }: PianoRollTimelineProps) => {
    const { timeline } = useAudioEngine();

    const width = timeline.samplesToPixels(clip.length);

    return (
      <svg
        width={width}
        className="flex-shrink-0 overflow-x-auto"
        height="1890px"
      >
        {renderGridLanes(width, 17.5, keys.length)}
      </svg>
    );
  }
);
