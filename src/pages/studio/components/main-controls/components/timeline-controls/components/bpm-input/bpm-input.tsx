import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { useRef } from "react";

export const BpmInput = observer(() => {
  const { timeline } = useAudioEngine();
  const bpmRef = useRef<HTMLInputElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      timeline.setBpm(timeline.bpm - 1);
    } else {
      timeline.setBpm(timeline.bpm + 1);
    }
  };

  return (
    <span className="w-full">
      <input
        name="bpm"
        id="bpm"
        ref={bpmRef}
        type="number"
        className="text-surface-4 w-[64px] text-2xl bg-surface-1 focus:bg-surface-3 focus:select-text p-1 text-ellipsis focus:outline-none"
        value={timeline.bpm}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => timeline.setBpm(parseInt(e.target.value))}
        onWheel={handleWheel}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            bpmRef?.current?.blur();
          }
        }}
      />
      <label className="text-surface-4 text-2xl m-0" htmlFor="bpm">
        BPM
      </label>
    </span>
  );
});
