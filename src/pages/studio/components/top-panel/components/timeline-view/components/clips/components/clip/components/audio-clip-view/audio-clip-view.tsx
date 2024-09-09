import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";

interface AudioClipViewProps {
  clip: AudioClip;
  track: Track;
}

export const AudioClipView = observer(({ clip }: AudioClipViewProps) => {
  const { mixer, timeline } = useAudioEngine();
  const width = timeline.samplesToPixels(clip.length);
  const selected = mixer.selectedClips.includes(clip);

  return (
    <div
      className="h-full flex-shrink-0"
      style={{
        opacity: selected ? 1 : 0.8,
        width,
      }}
    />
  );
});
