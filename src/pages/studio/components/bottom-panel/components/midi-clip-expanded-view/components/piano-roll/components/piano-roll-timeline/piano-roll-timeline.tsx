import { cn } from "@/lib/utils";
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";
import { observer } from "mobx-react-lite";
import { MidiNoteView } from "./components";
import * as Tone from "tone";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { usePianoRollMenuActions } from "../../hooks";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

export const renderGrid = (
  measuresArray: number[],
  measureWidth: number,
  subdivisionsArray: number[],
  subdivisionWidth: number,
  height: number,
  renderEveryFourthMeasure: boolean,
  startMeasure: number
) => {
  if (renderEveryFourthMeasure) {
    return measuresArray.map((_, i) => {
      const measureIndex = startMeasure + i * 4;
      return (
        <line
          className="z-20 stroke-current text-surface-2"
          key={`measure-${measureIndex}`}
          strokeWidth={1}
          x1={measureWidth * measureIndex}
          x2={measureWidth * measureIndex}
          y1={0}
          y2={height}
        />
      );
    });
  }

  return measuresArray.map((_, i) => (
    <g
      key={`measure-${startMeasure + i}`}
      transform={`translate(${measureWidth * (startMeasure + i)}, 0)`}
    >
      {subdivisionsArray.map((_, j) => (
        <line
          className="z-20 stroke-current text-surface-0"
          key={`subdivision-${startMeasure + i}-${j}`}
          strokeWidth={1}
          x1={subdivisionWidth * j + 1}
          x2={subdivisionWidth * j + 1}
          y1={0}
          y2={height}
        />
      ))}
    </g>
  ));
};

const renderGridLanes = (
  width: number,
  laneHeight: number,
  numKeys: number
) => {
  const isBlackKey = (index: number) => {
    const octavePosition = index % 12;
    return [1, 3, 5, 8, 10].includes(octavePosition);
  };

  const isLastKey = (index: number) => {
    return index === numKeys - 1;
  };

  const getRectHeight = (index: number) => {
    if (isBlackKey(index)) {
      return laneHeight - 1;
    }
    if (isLastKey(index)) {
      return laneHeight + 1;
    }

    return laneHeight;
  };

  return Array.from({ length: numKeys }).map((_, i) => (
    <g key={i}>
      <rect
        x={0}
        y={i * laneHeight - 1}
        height={getRectHeight(i)}
        width={width}
        className={cn(
          "fill-current opacity-20",
          isBlackKey(i) ? "text-zinc-600" : "text-zinc-400"
        )}
      />
      <line
        x1={0}
        x2={width}
        y1={i * laneHeight - 1}
        y2={i * laneHeight - 1}
        className="stroke-current stroke-surface-2"
        strokeWidth={1}
      />
    </g>
  ));
};

interface PianoRollTimelineProps {
  clip: MidiClip;
  keys: PitchNameTuple[];
  width: number;
  subdivisionWidth: number;
  subdivisionsArray: number[];
  renderEveryFourthMeasure: boolean;
  measuresArray: number[];
  measureWidth: number;
  startMeasure: number;
  endMeasure: number;
  setPlayheadLeft: React.Dispatch<SetStateAction<number>>;
}
export const PianoRollTimeline = observer(
  ({
    keys,
    width,
    measuresArray,
    measureWidth,
    subdivisionsArray,
    subdivisionWidth,
    renderEveryFourthMeasure,
    startMeasure,
    clip,
    setPlayheadLeft,
  }: PianoRollTimelineProps) => {
    const [selectedNotesDragOffset, setSelectedNoteDragOffset] = useState(0);
    const [selectedNotesPositionOffset, setSelectedNotePositionOffset] =
      useState(0);
    const [dragging, setDragging] = useState(false);
    const audioEngine = useAudioEngine();
    const { timeline } = audioEngine;
    const { undoManager } = useUndoManager();
    const menuActions = usePianoRollMenuActions(clip);

    const timelineRef = useRef<SVGSVGElement>(null);

    const clipStartOffsetPx = clip.samplesToPixels(
      clip.start - Tone.Time(clip.startMeasure, "m").toSamples()
    );

    const firstNoteRef = useRef<SVGRectElement>(null);

    useEffect(() => {
      if (clip.events.length && firstNoteRef.current) {
        const firstNoteElement = firstNoteRef.current;

        // TODO: Find a better way to fix this "TABS SCROLL OFFSCREEN" bug
        if (firstNoteElement && window.innerHeight > 568) {
          firstNoteElement.scrollIntoView({
            inline: "center",
            block: "center",
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clip]);

    const handleClick = (e: React.MouseEvent) => {
      undoManager.withoutUndo(() => {
        if (e.ctrlKey) {
          return;
        }
        if (timelineRef.current) {
          const xOffset = timelineRef.current.getBoundingClientRect().x;
          const xValue = e.clientX - xOffset + timelineRef.current.scrollLeft;
          const seconds = clip.snapToGrid
            ? Tone.Time(xValue * clip.samplesPerPixel, "samples").quantize(
                clip.subdivision
              )
            : Tone.Time(xValue * clip.samplesPerPixel, "samples").toSeconds();
          Tone.getTransport().seconds = seconds;
          timeline.setSeconds(seconds);

          const pixels =
            Tone.Time(Tone.getTransport().seconds, "s").toSamples() /
            clip.samplesPerPixel;
          setPlayheadLeft(pixels);
        }
      });
    };

    return (
      <StudioContextMenu
        disabled={
          audioEngine.state === AudioEngineState.playing ||
          audioEngine.state === AudioEngineState.recording
        }
        items={menuActions}
      >
        <svg
          ref={timelineRef}
          width={width}
          className="flex-shrink-0 overflow-x-auto relative"
          height="1890px"
          onClick={handleClick}
        >
          {renderGridLanes(width, 17.5, keys.length)}
          {renderGrid(
            measuresArray,
            measureWidth,
            subdivisionsArray,
            subdivisionWidth,
            1890,
            renderEveryFourthMeasure,
            startMeasure
          )}
          {clip.events.map((note, i) => (
            <MidiNoteView
              firstNoteRef={i === 0 ? firstNoteRef : undefined}
              dragging={dragging}
              setDragging={setDragging}
              selectedNotesDragOffset={selectedNotesDragOffset}
              setSelectedNotesDragOffset={setSelectedNoteDragOffset}
              selectedNotesPositionOffset={selectedNotesPositionOffset}
              setSelectedNotesPositionOffset={setSelectedNotePositionOffset}
              clipStartOffsetPx={clipStartOffsetPx}
              note={note}
              clip={clip}
            />
          ))}
        </svg>
      </StudioContextMenu>
    );
  }
);
