import { MidiClip, Timeline } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";

interface MidiClipViewProps {
  clip: MidiClip;
}

const getNoteXPosition = (note: MidiNote, timeline: Timeline) => {
  return timeline.samplesToPixels(note.on);
};

const getNoteYPosition = (note: MidiNote, noteHeight: number) => {
  const notes = [
    "B",
    "Bb",
    "A",
    "Ab",
    "G",
    "Gb",
    "F",
    "E",
    "Eb",
    "D",
    "Db",
    "C",
  ];
  return notes.indexOf(note.note[0]) * noteHeight;
};

const getNoteWidth = (note: MidiNote, timeline: Timeline) => {
  return timeline.samplesToPixels(note.length);
};

export const MidiClipView = observer(({ clip }: MidiClipViewProps) => {
  const { timeline, mixer } = useAudioEngine();

  const parentTrack = mixer.tracks.find((track) => track.id === clip.trackId);

  const noteHeight = (parentTrack!.laneHeight - 36) / 12;

  return (
    <svg
      width={timeline.samplesToPixels(clip.length)}
      height={parentTrack!.laneHeight - 30}
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
