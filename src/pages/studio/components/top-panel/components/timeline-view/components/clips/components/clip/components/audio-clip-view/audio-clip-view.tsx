import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import { useWaveform } from "./hooks/use-waveform";

import { observer } from "mobx-react-lite";

interface AudioClipViewProps {
  clip: AudioClip;
  track: Track;
}

export const AudioClipView = observer(({ clip, track }: AudioClipViewProps) => {
  const { width, height, canvasRef } = useWaveform(clip, track);

  return (
    <div
      className="h-full flex-shrink-0"
      style={{
        width,
        height,
      }}
    >
      <canvas
        style={{ background: "transparent" }}
        className="rounded-xl"
        ref={canvasRef}
        width={width}
        height={height}
      />
    </div>
  );
});
