import { observer } from "mobx-react-lite";
import { useAudioEngine } from "@/pages/studio/hooks";
import { TrackPanel } from "./components";
import {
  BASE_TRACK_HEIGHT,
  SCROLLBAR_OFFSET,
  TRACK_PANEL_COLLAPSED_WIDTH,
  TRACK_PANEL_EXPANDED_WIDTH,
} from "@/pages/studio/utils/constants";
import { useState } from "react";
import { isTouchDevice } from "@/pages/studio/utils";

interface TrackPanelsProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const TrackPanels = observer(
  ({ scrollRef, onScroll }: TrackPanelsProps) => {
    const [expanded, setExpanded] = useState(true);
    const { mixer } = useAudioEngine();
    const { tracks } = mixer;

    return (
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="no-scrollbar"
        style={{
          width: expanded
            ? TRACK_PANEL_EXPANDED_WIDTH
            : TRACK_PANEL_COLLAPSED_WIDTH,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <div
          className="flex flex-col"
          style={{
            minHeight: `calc(100vh + ${
              isTouchDevice() ? 0 : SCROLLBAR_OFFSET
            }px)`,
          }}
        >
          {tracks.map((track, i) => (
            <TrackPanel key={track.id} track={track} trackNumber={i + 1} />
          ))}
          {!isTouchDevice() && <div style={{ minHeight: SCROLLBAR_OFFSET }} />}
        </div>
      </div>
    );
  }
);
