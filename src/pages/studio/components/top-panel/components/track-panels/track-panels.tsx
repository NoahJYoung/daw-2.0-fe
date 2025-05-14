import { observer } from "mobx-react-lite";
import { useAudioEngine } from "@/pages/studio/hooks";
import { NewTrackPanelsButton, SamplePackForm, TrackPanel } from "./components";
import {
  SCROLLBAR_OFFSET,
  TRACK_PANEL_EXPANDED_WIDTH,
} from "@/pages/studio/utils/constants";
import { isTouchDevice } from "@/pages/studio/utils";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useTracksContextMenuActions } from "./hooks";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Track } from "@/pages/studio/audio-engine/components";
import { validateTrackNameForSampler } from "./helpers/validate-track-name-for-sampler";

interface TrackPanelsProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const TrackPanels = observer(
  ({ scrollRef, onScroll }: TrackPanelsProps) => {
    const audioEngine = useAudioEngine();
    const [newSampleFormOpen, setNewSampleFormOpen] = useState(false);
    const [tracksToCreateSamplePack, setTracksToCreateSamplePack] = useState<
      Track[]
    >([]);
    const convertibleTracks = tracksToCreateSamplePack.filter(
      (track) =>
        validateTrackNameForSampler(track.name) && track.clips.length > 0
    );
    const items = useTracksContextMenuActions();

    const { mixer, state } = audioEngine;
    const { tracks } = mixer;

    const handleClick = () => {
      if (mixer.selectedTracks.length < 1) {
        return;
      }

      mixer.unselectAllTracks();
    };

    const preparedItems = [
      ...items,
      { separator: true },
      {
        label: "Create Sample Pack",
        key: "create-sample-pack",
        onClick: () => {
          setTracksToCreateSamplePack(audioEngine.mixer.selectedTracks);
          setNewSampleFormOpen(true);
        },
        icon: () => <Upload className="w-4 h-4" />,
        disabled:
          state === AudioEngineState.playing ||
          state === AudioEngineState.recording ||
          !mixer.selectedTracks.every(
            (track) =>
              validateTrackNameForSampler(track.name) && track.clips.length > 0
          ),
      },
    ];

    return (
      <StudioContextMenu
        disabled={
          state === AudioEngineState.playing ||
          state === AudioEngineState.recording
        }
        items={preparedItems}
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
          <SamplePackForm
            open={newSampleFormOpen}
            onOpenChange={(open) => {
              setTracksToCreateSamplePack([]);
              setNewSampleFormOpen(open);
            }}
            tracks={convertibleTracks}
          />
        </div>
      </StudioContextMenu>
    );
  }
);
