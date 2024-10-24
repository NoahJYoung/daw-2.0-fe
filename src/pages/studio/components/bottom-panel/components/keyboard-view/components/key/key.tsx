import { cn } from "@/lib/utils";
import { KeyData } from "@/pages/studio/audio-engine/components/keyboard";
import {
  Octave,
  PitchNameTuple,
} from "@/pages/studio/audio-engine/components/midi-note/types";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { useState, useCallback, useEffect, useMemo } from "react";

export interface KeyProps {
  keyData: KeyData;
  baseOctave: Octave;
  left: number;
}

const pressedKeys = new Set<string>();

export const Key = observer(({ keyData, baseOctave, left }: KeyProps) => {
  const [active, setActive] = useState(false);
  const { keyboard, mixer, state } = useAudioEngine();

  const fullNoteName: PitchNameTuple = useMemo(
    () => [keyData.note, (keyData.relativeOctave + baseOctave) as Octave],
    [baseOctave, keyData.note, keyData.relativeOctave]
  );

  const joined = fullNoteName.join("");

  const attack = useCallback(() => {
    if (pressedKeys.has(joined)) return;
    pressedKeys.add(joined);
    setActive(true);
    keyboard.attack(fullNoteName, mixer, state);
  }, [joined, keyboard, fullNoteName, mixer, state]);

  const release = useCallback(() => {
    if (!pressedKeys.has(joined)) return;
    pressedKeys.delete(joined);
    setActive(false);
    keyboard.release(fullNoteName, mixer, state);
  }, [joined, keyboard, fullNoteName, mixer, state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.key !== keyData.keyboardKey) return;
      attack();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.repeat || e.key !== keyData.keyboardKey) return;
      release();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [attack, release, keyData.keyboardKey]);

  const getActiveBoxShadow = () => {
    if (active && keyData.type === "white") {
      return "inset 0 -3px 5px rgba(0, 0, 0, 0.2)";
    } else if (active && keyData.type === "black") {
      return "inset 0 -3px 5px rgba(0, 0, 0, 1)";
    }
    return "none";
  };

  return (
    <div
      className={cn(
        "flex justify-center items-end rounded-sm select-none border absolute",
        {
          "text-zinc-900 w-[80px] h-full min-h-[180px] bg-zinc-100 border-zinc-300":
            keyData.type === "white",
          "bg-zinc-900 text-zinc-100 w-[70px] h-3/4 min-h-[120px] ml-[-30px] z-20 border-zinc-100":
            keyData.type === "black",
        }
      )}
      style={{
        left,
        transformOrigin: "top",
        transform: active ? "scaleY(0.99)" : "none",
        boxShadow: getActiveBoxShadow(),
      }}
      onMouseDown={attack}
      onMouseUp={release}
      onMouseLeave={release}
      onTouchStart={attack}
      onTouchEnd={release}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <p>{keyData.keyboardKey.toUpperCase()}</p>
      {fullNoteName[0] === "C" && (
        <span
          style={{ bottom: active ? "-19.5%" : "-18%" }}
          className="absolute text-2xl text-surface-4"
        >
          {fullNoteName.join("")}
        </span>
      )}
    </div>
  );
});
