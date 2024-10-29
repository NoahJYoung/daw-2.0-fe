import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";

interface VerticalKeyboardProps {
  keyboardRef: React.RefObject<HTMLDivElement>;
  keys: PitchNameTuple[];
  onScroll: () => void;
}

export const VerticalKeyboard = ({
  keyboardRef,
  keys,
  onScroll,
}: VerticalKeyboardProps) => {
  return (
    <div
      onScroll={onScroll}
      ref={keyboardRef}
      // style={{ marginBottom: 16 }}
      className="flex flex-col w-[80px] flex-shrink-0 overflow-auto no-scrollbar max-h-full pt-[20px]"
    >
      {keys.map((key) => (
        <div className="relative" key={`${key[0]}-${key[1]}`}>
          {key[0].length === 1 ? (
            <div className="w-[80px] h-[30px] bg-zinc-100 border border-zinc-300 relative z-0 flex justify-end items-center">
              {key[0] === "C" && (
                <span className="text-zinc-500">{key.join("")}</span>
              )}
            </div>
          ) : (
            <div className="w-[50px] h-[17.5px] bg-zinc-900 border border-zinc-100 absolute top-[-10px] z-10" />
          )}
        </div>
      ))}
      {window.innerWidth >= 569 && <div className="h-[16px] flex-shrink-0" />}
    </div>
  );
};
