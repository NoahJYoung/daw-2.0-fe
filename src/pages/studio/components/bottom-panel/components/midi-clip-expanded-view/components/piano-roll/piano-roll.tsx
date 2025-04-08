/* eslint-disable react-hooks/exhaustive-deps */
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import {
  PianoRollPlayhead,
  PianoRollTopBar,
  VerticalKeyboard,
} from "./components";
import { PianoRollTimeline } from "./components/piano-roll-timeline";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getKeys } from "./helpers";
import {
  findSmallestSubdivision,
  subdivisionToQuarterMap,
} from "@/pages/studio/components/top-panel/components/timeline-view/helpers/calculate-grid-lines/calculate-grid-lines";
import {
  useAudioEngine,
  useRequestAnimationFrame,
  useUndoManager,
} from "@/pages/studio/hooks";
import * as Tone from "tone";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

interface PianoRollProps {
  clip: MidiClip;
}

export const PianoRoll = observer(({ clip }: PianoRollProps) => {
  const keyboardRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const audioEngine = useAudioEngine();
  const { undoManager } = useUndoManager();
  const { timeline } = audioEngine;
  const [renderPlayhead, setRenderPlayhead] = useState(false);
  const startPosition = clip.samplesToPixels(
    timeline.positionInSamples - clip.start
  );
  const playheadRef = useRef<HTMLDivElement>(null);
  const setPlayheadLeft = (pixels: number) => {
    if (!renderPlayhead && pixels >= 0) {
      setRenderPlayhead(true);
    }
    if (
      timelineContainerRef.current &&
      renderPlayhead &&
      pixels > timelineContainerRef.current.getBoundingClientRect().width
    ) {
      setRenderPlayhead(false);
    }
    if (playheadRef.current) {
      playheadRef.current.style.transform = `translateX(${pixels}px)`;
    }
  };

  const { timeSignature } = timeline;
  const keys = getKeys();

  const handleVerticalKeyboardScroll = () => {
    if (keyboardRef.current && timelineContainerRef.current) {
      timelineContainerRef.current.scrollTop = keyboardRef.current.scrollTop;
    }
  };

  const handleVerticalTimelineScroll = () => {
    if (keyboardRef.current && timelineContainerRef.current) {
      keyboardRef.current.scrollTop = timelineContainerRef.current.scrollTop;
    }
  };

  const smallestSubdivision = useMemo(
    () => findSmallestSubdivision(clip),
    [clip, clip.samplesPerPixel, clip.subdivision, timeline.bpm]
  );

  const subdivisionsPerBeat = useMemo(
    () => subdivisionToQuarterMap[smallestSubdivision],
    [smallestSubdivision, clip.samplesPerPixel, timeline.bpm]
  );

  const subdivisionsPerMeasure = useMemo(
    () => subdivisionsPerBeat * timeSignature,
    [subdivisionsPerBeat, timeSignature, clip.samplesPerPixel, timeline.bpm]
  );

  const generateArray = useCallback(
    (length: number) => Array.from({ length }, (_, i) => i),
    []
  );

  const subdivisionsArray = useMemo(
    () => generateArray(subdivisionsPerMeasure),
    [
      generateArray,
      subdivisionsPerMeasure,
      clip.samplesPerPixel,
      clip.startMeasure,
      timeline.bpm,
    ]
  );

  const startOffsetPx = clip.samplesToPixels(
    Tone.Time(clip.startMeasure, "m").toSamples()
  );

  const beatWidth = clip.samplesToPixels(Tone.Time("4n").toSamples());

  const measureWidth = beatWidth * timeSignature;

  const subdivisionWidth = measureWidth / subdivisionsPerMeasure;

  const containerWidth =
    timelineContainerRef.current?.getBoundingClientRect().width || 0;

  const width = Math.max(clip.zoomWidth, containerWidth + 16);

  const maxMeasures = Math.ceil(width / measureWidth);

  const measures = Math.max(clip.measures, maxMeasures);

  const measuresArray = generateArray(maxMeasures);

  useLayoutEffect(() => {
    undoManager.withoutUndo(() => {
      const pixels = clip.samplesToPixels(
        Tone.Time(Tone.getTransport().seconds, "s").toSamples()
      );
      setPlayheadLeft(pixels - startOffsetPx);
    });
  }, [
    audioEngine.state,
    timeline.positionInPixels,
    clip.start,
    clip.samplesPerPixel,
    clip,
  ]);

  useRequestAnimationFrame(
    () => {
      const pixels = clip.samplesToPixels(
        Tone.Time(Tone.getTransport().seconds, "s").toSamples()
      );
      setPlayheadLeft(pixels - startOffsetPx);
    },
    {
      enabled:
        audioEngine.state === AudioEngineState.playing ||
        audioEngine.state === AudioEngineState.recording,
    }
  );

  return (
    <div className="border border-surface-2 h-full flex flex-shrink-0 lg:max-h-[400px]">
      <VerticalKeyboard
        clip={clip}
        onScroll={handleVerticalKeyboardScroll}
        keys={keys}
        keyboardRef={keyboardRef}
      />
      <div
        className="flex flex-col overflow-auto flex-shrink-0 h-full styled-scrollbar max-h-full relative"
        onScroll={handleVerticalTimelineScroll}
        ref={timelineContainerRef}
        style={{ width: "calc(100% - 80px)" }}
      >
        <PianoRollTopBar
          renderEveryFourthMeasure={false}
          measureWidth={measureWidth}
          measuresArray={measuresArray}
          width={width}
          startMeasure={clip.startMeasure}
        />
        <PianoRollTimeline
          timelineContainerRef={timelineContainerRef}
          subdivisionWidth={subdivisionWidth}
          subdivisionsArray={subdivisionsArray}
          renderEveryFourthMeasure={false}
          measureWidth={measureWidth}
          measuresArray={measuresArray}
          startMeasure={0}
          endMeasure={measures + 1}
          width={width}
          keys={keys}
          clip={clip}
          setPlayheadLeft={setPlayheadLeft}
        />
        {renderPlayhead && (
          <PianoRollPlayhead ref={playheadRef} startPosition={startPosition} />
        )}
      </div>
    </div>
  );
});
