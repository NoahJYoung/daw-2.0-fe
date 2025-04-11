import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { ChannelStrip, MasterFader } from "./components";
import { useRef } from "react";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useTracksContextMenuActions } from "../../../top-panel/components/track-panels/hooks";
import { cn } from "@/lib/utils";

export const MixerView = observer(() => {
  const audioEngine = useAudioEngine();
  const items = useTracksContextMenuActions();
  const { state, mixer } = audioEngine;
  const mixerRef = useRef<HTMLDivElement>(null);

  return (
    <StudioContextMenu
      className="w-full h-full flex justify-center"
      disabled={
        state === AudioEngineState.playing ||
        state === AudioEngineState.recording
      }
      items={items}
    >
      <div
        className={cn(
          "w-[1376px] max-w-full p-1 pb-1 overflow-x-auto styled-scrollbar flex relative h-full justify-start max-h-[275px] mr-1"
        )}
      >
        <div
          onClick={() => mixer.unselectAllTracks()}
          ref={mixerRef}
          className="flex flex-shrink-0 min-w-screen h-full max-h-[276px] items-center bg-transparent sm:pb-[2px]"
        >
          <MasterFader mixerHeight={258} />
          {mixer.tracks.map((track, i) => (
            <ChannelStrip
              mixerHeight={258}
              key={track.id}
              track={track}
              trackNumber={i + 1}
            />
          ))}
        </div>
      </div>
    </StudioContextMenu>
  );
});
