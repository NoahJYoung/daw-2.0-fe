/* eslint-disable react-hooks/exhaustive-deps */
import { MidiClip } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { PianoRollTopBar, VerticalKeyboard } from "./components";
import { PianoRollTimeline } from "./components/piano-roll-timeline";
import { useCallback, useMemo, useRef } from "react";
import { getKeys } from "./helpers";
import {
  findSmallestSubdivision,
  subdivisionToQuarterMap,
} from "@/pages/studio/components/top-panel/components/timeline-view/helpers/calculate-grid-lines/calculate-grid-lines";
import { useAudioEngine } from "@/pages/studio/hooks";
import * as Tone from "tone";

interface PianoRollProps {
  clip: MidiClip;
}

export const PianoRoll = observer(({ clip }: PianoRollProps) => {
  const keyboardRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { timeline } = useAudioEngine();
  const { timeSignature, bpm } = timeline;
  const keys = getKeys();

  const handleVerticalKeyboardScroll = () => {
    if (keyboardRef.current && timelineRef.current) {
      timelineRef.current.scrollTop = keyboardRef.current.scrollTop;
    }
  };

  const handleVerticalTimelineScroll = () => {
    if (keyboardRef.current && timelineRef.current) {
      keyboardRef.current.scrollTop = timelineRef.current.scrollTop;
    }
  };

  const smallestSubdivision = useMemo(
    () => findSmallestSubdivision(clip),
    [clip, clip.samplesPerPixel, clip.subdivision]
  );

  const subdivisionsPerBeat = useMemo(
    () => subdivisionToQuarterMap[smallestSubdivision],
    [smallestSubdivision, clip.samplesPerPixel]
  );

  const subdivisionsPerMeasure = useMemo(
    () => subdivisionsPerBeat * timeSignature,
    [subdivisionsPerBeat, timeSignature, clip.samplesPerPixel]
  );

  const generateArray = useCallback(
    (length: number) => Array.from({ length }, (_, i) => i),
    []
  );

  const measuresArray = useMemo(
    () => generateArray(clip.measures),
    [generateArray, clip.measures, clip.samplesPerPixel, clip.startMeasure]
  );

  console.log("measures", clip.measures);

  const subdivisionsArray = useMemo(
    () => generateArray(subdivisionsPerMeasure),
    [
      generateArray,
      subdivisionsPerMeasure,
      clip.samplesPerPixel,
      clip.startMeasure,
    ]
  );

  const beatWidth = useMemo(
    () => clip.samplesToPixels(Tone.Time("4n").toSamples()),
    [clip, clip, clip.samplesPerPixel, bpm]
  );

  const measureWidth = beatWidth * timeSignature;

  const subdivisionWidth = measureWidth / subdivisionsPerMeasure;

  // const renderEveryFourthMeasure = beatWidth * timeSignature < 40;

  return (
    <div
      style={{ height: "calc(85% - 40px)" }}
      className="border border-surface-2 flex flex-shrink-0 md:max-h-[400px]"
    >
      <VerticalKeyboard
        clip={clip}
        onScroll={handleVerticalKeyboardScroll}
        keys={keys}
        keyboardRef={keyboardRef}
      />
      <div
        className="flex flex-col overflow-auto flex-shrink-o styled-scrollbar max-h-full "
        onScroll={handleVerticalTimelineScroll}
        ref={timelineRef}
        style={{ width: "calc(100% - 80px)", height: "100%" }}
      >
        <PianoRollTopBar
          renderEveryFourthMeasure={false}
          measureWidth={measureWidth}
          measuresArray={measuresArray}
          width={clip.zoomWidth}
          startMeasure={clip.startMeasure}
        />
        <PianoRollTimeline
          subdivisionWidth={subdivisionWidth}
          subdivisionsArray={subdivisionsArray}
          renderEveryFourthMeasure={false}
          measureWidth={measureWidth}
          measuresArray={measuresArray}
          startMeasure={0}
          endMeasure={clip.measures + 1}
          width={clip.zoomWidth}
          keys={keys}
          clip={clip}
        />
      </div>
    </div>
  );
});
