import { cn } from "@/lib/utils";
import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";
import { useState } from "react";

interface PianoRollKeyProps {
  note: PitchNameTuple;
  triggerAttack: (note: string) => void;
  triggerRelease: (note: string) => void;
}

export const PianoRollKey = ({
  note,
  triggerAttack,
  triggerRelease,
}: PianoRollKeyProps) => {
  const [active, setActive] = useState(false);
  const isWhiteKey = note[0].length === 1;
  const noteString = note.join("");

  const handleMouseDown = () => {
    triggerAttack(noteString);
    setActive(true);
  };

  const handleMouseUp = () => {
    triggerRelease(noteString);
    setActive(false);
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative"
    >
      {isWhiteKey ? (
        <div
          className={cn(
            "w-[80px] h-[30px] bg-zinc-100 border border-zinc-300 border-l-0 relative z-0 flex justify-end items-center",
            { "bg-zinc-300": active }
          )}
        >
          {note[0] === "C" && (
            <span className="text-zinc-400 select-none">{note.join("")}</span>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "w-[50px] h-[17.5px] bg-zinc-900 border border-zinc-100 absolute top-[-10px] z-10",
            { "bg-zinc-700": active }
          )}
        />
      )}
    </button>
  );
};
