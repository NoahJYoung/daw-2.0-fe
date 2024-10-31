import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { getColorFromVelocity, getTopValueFromPitch } from "./helpers";
import { observer } from "mobx-react-lite";

interface MidiNoteViewProps {
  note: MidiNote;
  clip: MidiClip;
}

export const MidiNoteView = observer(({ note, clip }: MidiNoteViewProps) => {
  const width = clip.samplesToPixels(note.off - note.on);
  const left = clip.samplesToPixels(note.on);
  const top = getTopValueFromPitch(note.note);
  const selected = clip.selectedNotes.includes(note);

  const generateRGBWithAlias = (alias: number) => {
    const rgb = getColorFromVelocity(note.velocity);

    return `rgba(${[...rgb, alias].join(", ")})`;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!e.ctrlKey) {
      clip.unselectAllNotes();
    }
    if (selected) {
      clip.unselectNote(note);
    } else {
      clip.selectNote(note);
    }
  };

  return (
    <span
      onClick={handleClick}
      style={{
        width,
        left,
        top,
        background: generateRGBWithAlias(selected ? 0.7 : 0.3),
        border: `1px solid ${generateRGBWithAlias(selected ? 0.7 : 0.5)}`,
      }}
      className="h-[17.5px] absolute rounded-sm"
    />
  );
});
