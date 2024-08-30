import { useAudioEngine } from "@/pages/studio/hooks";
import { BASE_TRACK_HEIGHT } from "@/pages/studio/utils/constants";
import { observer } from "mobx-react-lite";

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
        className="w-full h-full overflow-y-auto overflow-x-auto"
      >
        <div style={{ minHeight: "100vh" }}>
          {mixer.tracks.map((track) => (
            <div
              className="border border-secondary"
              key={track.id}
              style={{
                height: BASE_TRACK_HEIGHT,
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
