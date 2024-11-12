import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";
import { PianoRollKey } from "./components";
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { useAudioEngine } from "@/pages/studio/hooks";
import * as Tone from "tone";
interface VerticalKeyboardProps {
  keyboardRef: React.RefObject<HTMLDivElement>;
  keys: PitchNameTuple[];
  clip: MidiClip;
  onScroll: () => void;
}

export const VerticalKeyboard = ({
  keyboardRef,
  keys,
  clip,
  onScroll,
}: VerticalKeyboardProps) => {
  const { mixer } = useAudioEngine();

  const parentTrack = mixer.tracks.find((track) => track.id === clip.trackId);

  const triggerAttack = (noteString: string) => {
    if (parentTrack) {
      const { instrument } = parentTrack;
      instrument.triggerAttack(noteString, Tone.now(), 64);
    }
  };

  const triggerRelease = (noteString: string) => {
    if (parentTrack) {
      const { instrument } = parentTrack;
      instrument.triggerRelease(noteString, Tone.now(), 64);
    }
  };

  return (
    <div
      onScroll={onScroll}
      ref={keyboardRef}
      className="flex flex-col w-[80px] flex-shrink-0 overflow-auto no-scrollbar max-h-full pt-[20px] relative"
    >
      {keys.map((note) => (
        <PianoRollKey
          triggerAttack={triggerAttack}
          triggerRelease={triggerRelease}
          note={note}
          key={note.join("")}
        />
      ))}
      {window.innerWidth >= 569 && <div className="h-[16px] flex-shrink-0" />}
    </div>
  );
};
