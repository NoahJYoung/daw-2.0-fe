import { Track } from "@/pages/studio/audio-engine/components";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useAudioEngine, useRequestAnimationFrame } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import * as Tone from "tone";
import { usePlaceholderWaveform } from "./hooks";

interface PlaceholderClipProps {
  startPosition: number | null;
  track: Track;
}

function concatenateFloat32Arrays(arrays: Float32Array[]) {
  const totalLength = arrays.reduce((acc, array) => acc + array.length, 0);

  const result = new Float32Array(totalLength);

  let offset = 0;
  arrays.forEach((array) => {
    result.set(array, offset);
    offset += array.length;
  });

  return result;
}

export const PlaceholderClip = observer(
  ({ startPosition, track }: PlaceholderClipProps) => {
    const [width, setWidth] = useState(0);
    const { canvasRef, height, setWaveformData, waveformData } =
      usePlaceholderWaveform(track);
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
          if (waveformData) {
            setWaveformData(
              concatenateFloat32Arrays([
                waveformData,
                track.waveform.getValue(),
              ])
            );
          } else {
            setWaveformData(track.waveform.getValue());
          }
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
        className="absolute justify-end flex flex-col flex-shrink-0 rounded-xl gap-1 pb-[4px]"
        style={{
          top,
          width,
          left,
          marginTop: 4,
          height: track.laneHeight - 2,
          background: track.color,
          opacity: 0.5,
        }}
      >
        <canvas
          style={{ background: "transparent" }}
          className="rounded-xl flex-shrink-0"
          ref={canvasRef}
          width={width}
          height={height}
        />
      </div>
    ) : null;
  }
);
