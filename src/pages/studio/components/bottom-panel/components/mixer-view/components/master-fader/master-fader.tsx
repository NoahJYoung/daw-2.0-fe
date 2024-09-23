import { observer } from "mobx-react-lite";
import { debounce } from "lodash";
import {
  useAudioEngine,
  useBottomPanelViewController,
} from "@/pages/studio/hooks";
import { MeterFader } from "@/components/ui/custom/studio/meter-fader";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useEffect, useRef, useState } from "react";

export const MasterFader = observer(() => {
  const { mixer, state } = useAudioEngine();
  const { master } = mixer;

  const onChange = (value: number) => {
    master.setVolume(value);
  };

  const active =
    state === AudioEngineState.recording || state === AudioEngineState.playing;

  /////

  const faderContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const observedElement = faderContainerRef.current;

    // ResizeObserver callback to handle size changes
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const entry = entries[0];

      // Get the new size of the element
      const { height } = entry.contentRect;
      setContainerHeight(height);
    });

    // Observe the element
    if (observedElement) {
      resizeObserver.observe(observedElement);
    }

    // Cleanup the observer on component unmount
    return () => {
      if (observedElement) {
        resizeObserver.unobserve(observedElement);
      }
    };
  }, []);

  return (
    <div
      className={`flex flex-col flex-shrink-0 items-center bg-surface-2 border border-surface-1`}
      style={{
        width: 120,
        height: "100%",
      }}
    >
      <div className="flex gap-1 items-center w-full py-1 border-b-2 border-surface-1 py-5 h-8">
        <p className="text-lg text-surface-5 w-full text-center">Master</p>
      </div>

      <div ref={faderContainerRef} className="h-full w-full py-2">
        <MeterFader
          containerHeight={Math.max(containerHeight, 0)}
          onChange={onChange}
          step={0.01}
          min={-60}
          max={6}
          value={master.volume}
          meters={[master.meterL, master.meterR]}
          stopDelayMs={1000}
          active={active}
        />
      </div>
    </div>
  );
});
