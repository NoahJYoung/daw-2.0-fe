import { AudioClip, Track } from "@/pages/studio/audio-engine/components";
import { useWaveform } from "./hooks/use-waveform";

import { observer } from "mobx-react-lite";
import { useEffect } from "react";

interface AudioClipViewProps {
  clip: AudioClip;
  track: Track;
}

export const AudioClipView = observer(({ clip, track }: AudioClipViewProps) => {
  const { width, height, canvasRef } = useWaveform(clip, track);

  useEffect(() => {
    console.log("initializing clip");
  }, []);
  return (
    <div
      className="h-full flex-shrink-0 flex items-center"
      style={{
        width,
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
