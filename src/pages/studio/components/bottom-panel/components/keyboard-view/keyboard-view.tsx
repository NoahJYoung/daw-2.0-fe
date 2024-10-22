import { useAudioEngine } from "@/pages/studio/hooks";
import { keys } from "./helpers";
import { Key } from "./components";
import { cn } from "@/lib/utils";

export const KeyboardView = () => {
  const { keyboard } = useAudioEngine();
  const { baseOctave } = keyboard;

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
};
