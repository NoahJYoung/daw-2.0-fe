import { Timeline, Track } from "@/pages/studio/audio-engine/components";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useAudioEngine, useRequestAnimationFrame } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import * as Tone from "tone";
import { usePlaceholderWaveform } from "./hooks";
import { EventData } from "@/pages/studio/audio-engine/components/keyboard/types";
interface PlaceholderClipProps {
  startPosition: number | null;
  track: Track;
}

export const getPlaceholderNoteXPosition = (
  note: EventData,
  timeline: Timeline,
  left: number
) => timeline.samplesToPixels(note.on) - left;

export const getPlaceholderNoteYPosition = (
  note: EventData,
  noteHeight: number
) => {
  const notes = [
    "B",
    "Bb",
    "A",
    "Ab",
    "G",
    "Gb",
    "F",
    "E",
    "Eb",
    "D",
    "Db",
    "C",
  ];
  return notes.indexOf(note.note[0]) * noteHeight;
};

export const getPlaceholderNoteWidth = (
  note: EventData,
  timeline: Timeline
) => {
  return timeline.samplesToPixels(note.off - note.on);
};

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
    const { timeline, mixer, keyboard } = audioEngine;

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

    const getColor = () => {
      const [r, g, b] = track.rgb;
      const color = `linear-gradient(
    to bottom, 
    rgba(${r}, ${g}, ${b}, 0.5), 
    rgba(${r}, ${g}, ${b}, 1)`;
      return color;
    };

    const noteHeight = (track.laneHeight - 36 - 20) / 12;

    return renderPlaceholderClip ? (
      <div
        className="absolute justify-end flex flex-col flex-shrink-0 rounded-xl gap-1 pb-[4px] pt-[24px]"
        style={{
          top,
          width,
          left,
          marginTop: 4,
          height: track.laneHeight - 2,
          background: getColor(),
          opacity: 0.5,
        }}
      >
        {track.input === "mic" ? (
          <canvas
            style={{ background: "transparent" }}
            className="rounded-xl flex-shrink-0"
            ref={canvasRef}
            width={width}
            height={height}
          />
        ) : (
          <svg
            width={width}
            height={track!.laneHeight - 30}
            className="mb-[6px]"
          >
            {keyboard.events.map((event, i) => (
              <rect
                key={i}
                fill="black"
                height={noteHeight}
                width={getPlaceholderNoteWidth(event, timeline)}
                x={getPlaceholderNoteXPosition(event, timeline, left)}
                rx="2px"
                y={getPlaceholderNoteYPosition(event, noteHeight)}
              />
            ))}
          </svg>
        )}
      </div>
    ) : null;
  }
);
