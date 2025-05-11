import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";

export const BpmInput = observer(({ className }: { className: string }) => {
  const { timeline } = useAudioEngine();
  const bpmRef = useRef<HTMLInputElement>(null);
  const [localBpmValue, setLocalBpmValue] = useState(timeline.bpm);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      setLocalBpmValue(localBpmValue - 1);
    } else {
      setLocalBpmValue(localBpmValue + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBpmValue(parseInt(e.target.value));
  };

  const handleBlur = () => {
    timeline.setBpm(localBpmValue);
  };

  useEffect(() => {
    setLocalBpmValue(timeline.bpm);
  }, [timeline.bpm]);

  return (
    <span className={className}>
      <input
        name="bpm"
        id="bpm"
        ref={bpmRef}
        type="number"
        className="text-surface-4 w-[64px] text-xl lg:text-2xl bg-surface-mid focus:bg-surface-2 focus:select-text p-1 text-ellipsis focus:outline-none"
        value={localBpmValue}
        onClick={(e) => e.stopPropagation()}
        onChange={handleChange}
        onBlur={handleBlur}
        onWheel={handleWheel}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            bpmRef?.current?.blur();
          }
        }}
      />
      <label className="flex items-center text-surface-4 m-0" htmlFor="bpm">
        bpm
      </label>
    </span>
  );
});
