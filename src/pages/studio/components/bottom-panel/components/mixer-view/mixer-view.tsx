import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { ChannelStrip } from "./components";

export const MixerView = observer(() => {
  const { mixer } = useAudioEngine();

  return (
    <div className="flex w-full h-full bg-transparent sm:pb-[2px]">
      {mixer.tracks.map((track, i) => (
        <ChannelStrip key={track.id} track={track} trackNumber={i + 1} />
      ))}
    </div>
  );
});
