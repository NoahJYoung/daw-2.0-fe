import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { ChannelStrip, MasterFader } from "./components";
import { useLayoutEffect, useRef, useState } from "react";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useTracksContextMenuActions } from "../../../top-panel/components/track-panels/hooks";

export const MixerView = observer(() => {
  const audioEngine = useAudioEngine();
  const items = useTracksContextMenuActions();
  const { state, mixer } = audioEngine;
  const mixerRef = useRef<HTMLDivElement>(null);

  const [mixerHeight, setMixerHeight] = useState(0);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (mixerRef.current) {
        setMixerHeight(mixerRef.current.getBoundingClientRect().height);
      }
    };
    updateHeight();

    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  return (
    <StudioContextMenu
      disabled={
        state === AudioEngineState.playing ||
        state === AudioEngineState.recording
      }
      items={items}
    >
      <div
        onClick={() => mixer.unselectAllTracks()}
        ref={mixerRef}
        className="flex w-full h-full max-h-[350px] bg-transparent sm:pb-[2px]"
      >
        <MasterFader mixerHeight={mixerHeight} />
        {mixer.tracks.map((track, i) => (
          <ChannelStrip
            mixerHeight={mixerHeight}
            key={track.id}
            track={track}
            trackNumber={i + 1}
          />
        ))}
      </div>
    </StudioContextMenu>
  );
});
