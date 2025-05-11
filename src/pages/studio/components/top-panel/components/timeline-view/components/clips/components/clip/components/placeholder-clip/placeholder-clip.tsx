/* eslint-disable react-refresh/only-export-components */
import { Timeline, Track } from "@/pages/studio/audio-engine/components";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useAudioEngine, useRequestAnimationFrame } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { useRef, useState, useMemo } from "react";
import * as Tone from "tone";
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
  return 8 + notes.indexOf(note.note[0]) * noteHeight;
};

export const getPlaceholderNoteWidth = (
  note: EventData,
  timeline: Timeline
) => {
  return timeline.samplesToPixels(note.off - note.on);
};

const MemoizedNotes = observer(
  ({
    events,
    timeline,
    left,
    noteHeight,
    width,
    height,
  }: {
    events: EventData[];
    timeline: Timeline;
    left: number;
    noteHeight: number;
    width: number;
    height: number;
  }) => {
    return (
      <svg width={width} height={height} className="mb-[6px]">
        {events.map((event, i) => (
          <rect
            key={i}
            fill="black"
            height={noteHeight}
            width={getPlaceholderNoteWidth(event, timeline)}
            x={getPlaceholderNoteXPosition(event, timeline, left)}
            y={getPlaceholderNoteYPosition(event, noteHeight)}
          />
        ))}
      </svg>
    );
  }
);

export const PlaceholderClip = observer(
  ({ startPosition, track }: PlaceholderClipProps) => {
    const [width, setWidth] = useState(0);
    const startPixelsRef = useRef(0);

    const audioEngine = useAudioEngine();
    const { timeline, mixer, keyboard } = audioEngine;

    const renderPlaceholderClip = Boolean(
      startPosition !== null && audioEngine.state === AudioEngineState.recording
    );

    useMemo(() => {
      if (startPosition !== null) {
        const startSamples = Tone.Time(startPosition, "s").toSamples();
        startPixelsRef.current = timeline.samplesToPixels(startSamples);
      }
    }, [startPosition, timeline]);

    useRequestAnimationFrame(
      () => {
        if (startPosition !== null) {
          const timelinePosition = timeline.samplesToPixels(
            Tone.Time(Tone.getTransport().seconds, "s").toSamples()
          );
          const newWidth = timelinePosition - startPixelsRef.current;
          setWidth(newWidth);
        }
      },
      {
        enabled: renderPlaceholderClip,
      }
    );

    const clipStyle = useMemo(() => {
      const top = mixer.getCombinedLaneHeightsAtIndex(
        mixer.tracks.indexOf(track)
      );

      const [r, g, b] = track.rgb;
      const color = `linear-gradient(
        to bottom, 
        rgba(${r}, ${g}, ${b}, 0.5), 
        rgba(${r}, ${g}, ${b}, 1)`;

      return {
        transform: `translate(${startPixelsRef.current}px, ${top}px)`,
        width: `${width}px`,
        marginTop: 4,
        height: track.laneHeight - 2,
        background: color,
        opacity: 0.5,
        willChange: "transform, width",
      };
    }, [mixer, track, width]);

    const noteHeight = useMemo(
      () => (track.laneHeight - 36 - 20) / 12,
      [track.laneHeight]
    );

    if (!renderPlaceholderClip) return null;

    return renderPlaceholderClip ? (
      <div
        className="absolute justify-end flex flex-col flex-shrink-0 rounded-xl gap-1 pb-[4px] pt-[24px]"
        style={clipStyle}
      >
        {track.inputType === "mic" ? null : (
          <MemoizedNotes
            events={keyboard.events}
            timeline={timeline}
            left={startPixelsRef.current}
            noteHeight={noteHeight}
            width={width}
            height={track.laneHeight - 30}
          />
        )}
      </div>
    ) : null;
  }
);
