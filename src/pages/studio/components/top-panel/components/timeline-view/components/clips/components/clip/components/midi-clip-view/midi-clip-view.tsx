import { MidiClip, Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import {
  getNoteWidth,
  getNoteXPosition,
  getNoteYPosition,
} from "../../helpers";

interface MidiClipViewProps {
  clip: MidiClip;
  track: Track;
}

export const MidiClipView = observer(({ clip, track }: MidiClipViewProps) => {
  const { timeline } = useAudioEngine();

  const noteHeight = (track!.laneHeight - 36) / 12;

  return (
    <svg
      width={timeline.samplesToPixels(clip.length)}
      height={track!.laneHeight - 30}
      className="mb-[6px]"
    >
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
    </svg>
  );
});
