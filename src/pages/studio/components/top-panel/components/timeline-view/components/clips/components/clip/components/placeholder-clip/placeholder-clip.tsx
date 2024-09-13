import { Track } from "@/pages/studio/audio-engine/components";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useAudioEngine, useRequestAnimationFrame } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import * as Tone from "tone";

interface PlaceholderClipProps {
  startPosition: number | null;
  track: Track;
}

export const PlaceholderClip = observer(
  ({ startPosition, track }: PlaceholderClipProps) => {
    const [width, setWidth] = useState(0);
    const audioEngine = useAudioEngine();
    const { timeline, mixer } = audioEngine;

    const renderPlaceholderClip = Boolean(
      startPosition !== null && audioEngine.state === AudioEngineState.recording
    );
    useRequestAnimationFrame(
      () => {
        if (startPosition !== null) {
          const startSeconds = startPosition;
          const startSamples = Tone.Time(startSeconds, "s").toSamples();
          const startPixels = timeline.samplesToPixels(startSamples);
          const timelinePosition = timeline.samplesToPixels(
            Tone.Time(Tone.getTransport().seconds, "s").toSamples()
          );
          const newWidth = timelinePosition - startPixels;
          setWidth(newWidth);
        }
      },
      {
        enabled: renderPlaceholderClip,
      }
    );

    const left = timeline.samplesToPixels(
      Tone.Time(startPosition || 0, "s").toSamples()
    );

    const top = mixer.getCombinedLaneHeightsAtIndex(
      mixer.tracks.indexOf(track)
    );

    return renderPlaceholderClip ? (
      <div
        className="absolute rounded-xl"
        style={{
          top,
          width,
          left,
          marginTop: 4,
          height: track.laneHeight - 2,
          background: track.color,
          opacity: 0.5,
        }}
      />
    ) : null;
  }
);
