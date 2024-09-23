import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { ChannelStrip, MasterFader } from "./components";
import { useLayoutEffect, useRef, useState } from "react";

export const MixerView = observer(() => {
  const { mixer } = useAudioEngine();
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
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div
      onClick={() => mixer.unselectAllTracks()}
      ref={mixerRef}
      className="flex w-full h-full bg-transparent sm:pb-[2px]"
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
  );
});
