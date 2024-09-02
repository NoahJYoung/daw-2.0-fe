import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { TopBar } from "./components";

interface TimelineViewProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const TimelineView = observer(
  ({ onScroll, scrollRef }: TimelineViewProps) => {
    const audioEngine = useAudioEngine();
    const { timeline, mixer } = audioEngine;

    return (
      <div
        onScroll={onScroll}
        ref={scrollRef}
        className="w-full bg-surface-0 z-10 h-full overflow-y-auto overflow-x-auto"
        style={{ height: "100%" }}
      >
        <div
          className="flex flex-col"
          style={{
            height: mixer.combinedLaneHeights,
          }}
        >
          <TopBar />

          {mixer.tracks.map((track) => (
            <div
              className="border border-secondary"
              key={track.id}
              style={{
                height: track.laneHeight,
                width: timeline.pixels,
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
);
