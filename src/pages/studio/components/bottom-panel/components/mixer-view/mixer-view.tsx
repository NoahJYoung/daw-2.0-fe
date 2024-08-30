import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { ChannelStrip } from "./components";

export const MixerView = observer(() => {
  const { mixer } = useAudioEngine();

  return (
    <div className="flex gap-1">
      {mixer.tracks.map((track) => (
        <ChannelStrip key={track.id} track={track} />
      ))}
    </div>
  );
});
