import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { Clip } from "./components";
import { PlaceholderClip } from "./components/clip/components";
import { useEffect, useState } from "react";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

export const Clips = observer(() => {
  const { mixer, timeline, state } = useAudioEngine();
  const [placeholderClipPosition, setPlaceholderClipPosition] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (state === AudioEngineState.recording) {
      setPlaceholderClipPosition(timeline.seconds);
    } else {
      setPlaceholderClipPosition(null);
    }
  }, [state, timeline.seconds]);

  return (
    <div
      className="absolute flex flex-col"
      style={{
        width: timeline.pixels,
        height: mixer.topPanelHeight,
        top: 72,
      }}
    >
      {mixer.tracks.map((track, i) => (
        <div
          style={{ top: mixer.getCombinedLaneHeightsAtIndex(i) }}
          key={track.id}
          className="flex flex-shrink-0 absolute"
        >
          {state === AudioEngineState.recording && track.active && (
            <PlaceholderClip
              track={track}
              startPosition={placeholderClipPosition}
            />
          )}
          {track.clips.map((clip) => (
            <Clip key={clip.id} track={track} clip={clip} />
          ))}
        </div>
      ))}
    </div>
  );
});
