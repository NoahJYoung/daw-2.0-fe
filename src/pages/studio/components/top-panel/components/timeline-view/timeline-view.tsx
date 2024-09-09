/* eslint-disable react-hooks/exhaustive-deps */
import { observer } from "mobx-react-lite";
import { Clips, Grid, Playhead, TopBar } from "./components";
import {
  useAudioEngine,
  useRequestAnimationFrame,
  useUndoManager,
} from "@/pages/studio/hooks";
import { useMemo, useCallback, useEffect, useState } from "react";
import * as Tone from "tone";
import {
  findSmallestSubdivision,
  subdivisionToQuarterMap,
} from "./helpers/calculate-grid-lines/calculate-grid-lines";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

interface TimelineViewProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const TimelineView = observer(
  ({ onScroll, scrollRef }: TimelineViewProps) => {
    const audioEngine = useAudioEngine();
    const undoManager = useUndoManager();
    const { timeline, mixer } = audioEngine;
    const { pixels, measures, timeSignature } = timeline;

    const measureWidth = useMemo(() => pixels / measures, [pixels, measures]);

    const smallestSubdivision = useMemo(
      () => findSmallestSubdivision(timeline),
      [timeline, timeline.samplesPerPixel]
    );

    const subdivisionsPerBeat = useMemo(
      () => subdivisionToQuarterMap[smallestSubdivision],
      [smallestSubdivision, timeline.samplesPerPixel]
    );

    const subdivisionsPerMeasure = useMemo(
      () => subdivisionsPerBeat * timeSignature,
      [subdivisionsPerBeat, timeSignature, timeline.samplesPerPixel]
    );

    const subdivisionWidth = useMemo(
      () =>
        timeline.samplesToPixels(Tone.Time(smallestSubdivision).toSamples()),
      [timeline, smallestSubdivision, timeline.samplesPerPixel]
    );

    const generateArray = useCallback(
      (length: number) => Array.from({ length }, (_, i) => i),
      []
    );

    const measuresArray = useMemo(
      () => generateArray(measures),
      [generateArray, measures, timeline.samplesPerPixel]
    );

    const subdivisionsArray = useMemo(
      () => generateArray(subdivisionsPerMeasure),
      [generateArray, subdivisionsPerMeasure, timeline.samplesPerPixel]
    );

    const beatWidth = useMemo(
      () => timeline.samplesToPixels(Tone.Time("4n").toSamples()),
      [timeline, timeline.samplesPerPixel]
    );

    const renderEveryFourthMeasure = beatWidth * timeSignature < 40;

    const handleClick = (e: React.MouseEvent) => {
      undoManager.withoutUndo(() => {
        if (scrollRef.current) {
          const xOffset = scrollRef.current.getBoundingClientRect().x;
          const xValue = e.clientX - xOffset + scrollRef.current.scrollLeft;
          timeline.setSecondsFromPixels(xValue);
          setPlayheadLeft(timeline.positionInPixels);
        }
      });
    };

    const [playheadLeft, setPlayheadLeft] = useState(timeline.positionInPixels);

    useRequestAnimationFrame(
      () => {
        setPlayheadLeft(
          timeline.samplesToPixels(
            Tone.Time(Tone.getTransport().seconds, "s").toSamples()
          )
        );
      },
      {
        enabled:
          audioEngine.state === AudioEngineState.playing ||
          audioEngine.state === AudioEngineState.recording,
      }
    );

    useEffect(() => {
      undoManager.withoutUndo(() => {
        timeline.setSeconds(Tone.getTransport().seconds);
      });
      setPlayheadLeft(timeline.positionInPixels);
    }, [audioEngine.state]);

    const handleWheel = (e: WheelEvent) => {
      if (e.altKey) {
        e.preventDefault();
        undoManager.withoutUndo(() => {
          if (e.deltaY > 0) {
            timeline.zoomOut();
          } else {
            timeline.zoomIn();
          }
        });
      }
    };

    useEffect(() => {
      const container = scrollRef.current;
      if (container) {
        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
          container.removeEventListener("wheel", handleWheel);
        };
      }
    }, []);

    return (
      <div
        onClick={handleClick}
        onScroll={onScroll}
        ref={scrollRef}
        style={{ width: pixels }}
        className="h-full bg-surface-0 z-10 styled-scrollbar overflow-auto relative pt-[2px]"
      >
        <TopBar
          renderEveryFourthMeasure={renderEveryFourthMeasure}
          subdivisionsArray={subdivisionsArray}
          measuresArray={measuresArray}
          measureWidth={measureWidth}
          subdivisionWidth={subdivisionWidth}
          subdivisionsPerBeat={subdivisionsPerBeat}
        />

        <Grid
          scrollRef={scrollRef}
          subdivisionWidth={subdivisionWidth}
          subdivisionsArray={subdivisionsArray}
          renderEveryFourthMeasure={renderEveryFourthMeasure}
          measureWidth={measureWidth}
          measuresArray={measuresArray}
        />

        <Clips />

        <Playhead height={mixer.topPanelHeight + 74} left={playheadLeft} />
      </div>
    );
  }
);
