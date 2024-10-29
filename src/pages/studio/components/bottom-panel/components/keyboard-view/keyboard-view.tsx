import { useAudioEngine } from "@/pages/studio/hooks";
import { keys } from "./helpers";
import { Key } from "./components";
import { cn } from "@/lib/utils";
import { Octave } from "@/pages/studio/audio-engine/components/midi-note/types";
import { useCallback, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
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
    <>
      <span className=" text-surface-5 h-[24px] flex-shrink-0 flex justify-center w-full gap-6 items-center text-2xl">
        <button className="hover:opacity-80" onClick={decrementOctave}>
          <FaMinus />
        </button>
        <span>Octave</span>
        <button className="hover:opacity-80" onClick={incrementOctave}>
          <FaPlus />
        </button>
      </span>
      <div
        className={cn(
          "w-[1360px] max-w-full p-1 pb-4 overflow-x-auto styled-scrollbar flex relative h-full justify-start max-h-[275px] mr-1"
        )}
      >
        {keys.map((key, i, arr) => {
          let left = 0;

          if (key.type === "black") {
            left =
              arr.slice(0, i).filter((k) => k.type === "white").length * 80 - 5;
          } else {
            left =
              arr.slice(0, i).filter((k) => k.type === "white").length * 80;
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
    </>
  );
});
