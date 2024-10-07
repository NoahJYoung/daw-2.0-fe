import { observer } from "mobx-react-lite";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { NewTrackPanelsButton, TrackPanel } from "./components";
import {
  SCROLLBAR_OFFSET,
  TRACK_PANEL_EXPANDED_WIDTH,
} from "@/pages/studio/utils/constants";
import { isTouchDevice } from "@/pages/studio/utils";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import { getTracksContextMenuActions } from "./helpers";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

interface TrackPanelsProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const TrackPanels = observer(
  ({ scrollRef, onScroll }: TrackPanelsProps) => {
    const audioEngine = useAudioEngine();
    const { undoManager } = useUndoManager();
    const { mixer, state } = audioEngine;
    const { tracks } = mixer;

    const handleClick = () => {
      if (mixer.selectedTracks.length < 1) {
        return;
      }

      mixer.unselectAllTracks();
    };

    return (
      <StudioContextMenu
        disabled={
          state === AudioEngineState.playing ||
          state === AudioEngineState.recording
        }
        items={getTracksContextMenuActions(audioEngine, undoManager)}
      >
        <div
          ref={scrollRef}
          onScroll={onScroll}
          onClick={handleClick}
          className="no-scrollbar relative flex flex-col max-h-full overflow-y-auto flex-shrink-0 border-r-4 border-surface-0 mx-[2px] pr-[2px]"
          style={{
            width: TRACK_PANEL_EXPANDED_WIDTH,
            height: "calc(100% - 74px)",
          }}
        >
          <div
            className="flex flex-col flex-shrink-0"
            style={{
              height: mixer.topPanelHeight + 80 + SCROLLBAR_OFFSET,
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
            <NewTrackPanelsButton />
            {!isTouchDevice() && (
              <div style={{ minHeight: SCROLLBAR_OFFSET }} />
            )}
          </div>
        </div>
      </StudioContextMenu>
    );
  }
);
