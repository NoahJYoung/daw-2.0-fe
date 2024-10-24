import { useAudioEngine } from "@/pages/studio/hooks";
import { keys } from "./helpers";
import { Key } from "./components";
import { cn } from "@/lib/utils";
import { Octave } from "@/pages/studio/audio-engine/components/midi-note/types";
import { useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";

export const KeyboardView = observer(() => {
  const { keyboard } = useAudioEngine();
  const { baseOctave } = keyboard;

  const incrementOctave = useCallback(() => {
    if (keyboard.baseOctave <= 5) {
      keyboard.setBaseOctave((keyboard.baseOctave + 1) as Octave);
    }
  }, [keyboard]);

  const decrementOctave = useCallback(() => {
    if (keyboard.baseOctave >= 1) {
      keyboard.setBaseOctave((keyboard.baseOctave - 1) as Octave);
    }
  }, [keyboard]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "+") {
        incrementOctave();
      } else if (e.key === "-") {
        decrementOctave();
      }
    },
    [decrementOctave, incrementOctave]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className={cn(
        "w-[1360px] flex relative justify-start max-h-[225px] mr-1"
      )}
    >
      {keys.map((key, i, arr) => {
        let left = 0;

        if (key.type === "black") {
          left =
            arr.slice(0, i).filter((k) => k.type === "white").length * 80 - 5;
        } else {
          left = arr.slice(0, i).filter((k) => k.type === "white").length * 80;
        }

        return (
          <Key
            baseOctave={baseOctave}
            left={left}
            keyData={key}
            key={key.note + i}
          />
        );
      })}
    </div>
  );
});
