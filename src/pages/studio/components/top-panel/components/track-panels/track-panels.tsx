import { observer } from "mobx-react-lite";
import { useAudioEngine } from "@/pages/studio/hooks";
import { TrackPanel } from "./components";
import {
  SCROLLBAR_OFFSET,
  TRACK_PANEL_EXPANDED_WIDTH,
} from "@/pages/studio/utils/constants";
import { isTouchDevice } from "@/pages/studio/utils";

interface TrackPanelsProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const TrackPanels = observer(
  ({ scrollRef, onScroll }: TrackPanelsProps) => {
    const { mixer } = useAudioEngine();
    const { tracks } = mixer;

    return (
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onClick={() => mixer.unselectAllTracks()}
        className="no-scrollbar relative flex flex-col max-h-full overflow-y-auto flex-shrink-0 border-r-4 border-surface-0 mx-[2px] pr-[2px]"
        style={{
          width: TRACK_PANEL_EXPANDED_WIDTH,
          height: "calc(100% - 74px)",
        }}
      >
        <div
          className="flex flex-col flex-shrink-0"
          style={{
            height: mixer.topPanelHeight + SCROLLBAR_OFFSET,
          }}
        >
          {tracks.map((track, i) => (
            <TrackPanel
              parentRef={scrollRef}
              key={track.id}
              track={track}
              trackNumber={i + 1}
            />
          ))}
          {!isTouchDevice() && <div style={{ minHeight: SCROLLBAR_OFFSET }} />}
        </div>
      </div>
    );
  }
);
