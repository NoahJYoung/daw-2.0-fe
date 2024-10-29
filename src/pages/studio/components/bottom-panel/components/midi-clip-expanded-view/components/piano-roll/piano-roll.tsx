import { MidiClip } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { PianoRollTopBar, VerticalKeyboard } from "./components";
import { PianoRollTimeline } from "./components/piano-roll-timeline";
import { useRef } from "react";
import { usePianoRoll } from "./hooks";

interface PianoRollProps {
  clip: MidiClip;
}

export const PianoRoll = observer(({ clip }: PianoRollProps) => {
  const keyboardRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { keys, width } = usePianoRoll(clip);

  const handleVerticalKeyboardScroll = () => {
    if (keyboardRef.current && timelineRef.current) {
      timelineRef.current.scrollTop = keyboardRef.current.scrollTop;
    }
  };

  const handleVerticalTimelineScroll = () => {
    if (keyboardRef.current && timelineRef.current) {
      keyboardRef.current.scrollTop = timelineRef.current.scrollTop;
    }
  };

  return (
    <div
      style={{ height: "calc(85% - 40px)" }}
      className="border border-surface-2 flex flex-shrink-0 md:max-h-[400px]"
    >
      <VerticalKeyboard
        onScroll={handleVerticalKeyboardScroll}
        keys={keys}
        keyboardRef={keyboardRef}
      />
      <div
        className="flex flex-col overflow-auto flex-shrink-o styled-scrollbar max-h-full "
        onScroll={handleVerticalTimelineScroll}
        ref={timelineRef}
        style={{ width: "calc(100% - 80px)", height: "100%" }}
      >
        <PianoRollTopBar width={width} />
        <PianoRollTimeline width={width} keys={keys} clip={clip} />
      </div>
    </div>
  );
});
