/* eslint-disable react-hooks/exhaustive-deps */
import { observer } from "mobx-react-lite";
import {
  Clips,
  Grid,
  Playhead,
  TimelineHotKeysManager,
  TopBar,
} from "./components";
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
import { Timeline } from "@/pages/studio/audio-engine/components";

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

    const [scrollLeft, setScrollLeft] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
      const updateViewportWidth = () => {
        if (scrollRef.current) {
          setViewportWidth(scrollRef.current.clientWidth);
        }
      };

      const handleScroll = () => {
        if (scrollRef.current) {
          setScrollLeft(scrollRef.current.scrollLeft);
        }
      };

      const scroll = scrollRef.current;

      if (scroll) {
        scroll.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", updateViewportWidth);
        updateViewportWidth();
      }

      return () => {
        if (scroll) {
          scroll.removeEventListener("scroll", handleScroll);
        }
        window.removeEventListener("resize", updateViewportWidth);
      };
    }, [scrollRef]);

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

    const adjustScrollToZoomChange = (
      timeline: Timeline,
      containerRef: React.RefObject<HTMLDivElement>
    ) => {
      const newScrollLeft = timeline.positionInPixels - window.innerWidth / 2;
      if (containerRef.current) {
        containerRef.current.scrollLeft = newScrollLeft;
      }
    };

    useEffect(() => {
      setPlayheadLeft(timeline.positionInPixels);
    }, [timeline.positionInPixels, timeline.samplesPerPixel]);

    const handleWheel = (e: WheelEvent) => {
      if (e.altKey) {
        e.preventDefault();
        undoManager.withoutUndo(() => {
          if (e.deltaY > 0) {
            timeline.zoomOut();
          } else {
            timeline.zoomIn();
          }
          adjustScrollToZoomChange(timeline, scrollRef);
        });
      }
    };

    const calculateVisibleRange = useCallback(() => {
      if (renderEveryFourthMeasure) {
        const startMeasure =
          Math.max(Math.floor(scrollLeft / (measureWidth * 4)) - 1) >= 0
            ? Math.max(Math.floor(scrollLeft / (measureWidth * 4)) - 1)
            : 0;
        const endMeasure = Math.min(
          Math.ceil((scrollLeft + viewportWidth) / (measureWidth * 4)) + 1,
          Math.floor(measuresArray.length / 4)
        );

        return {
          startMeasure: startMeasure * 4,
          endMeasure: endMeasure * 4,
        };
      }
      const startMeasure = Math.max(
        Math.floor(scrollLeft / measureWidth) - 4,
        0
      );
      const endMeasure = Math.min(
        Math.ceil((scrollLeft + viewportWidth) / measureWidth) + 4,
        measuresArray.length
      );
      return { startMeasure, endMeasure };
    }, [
      renderEveryFourthMeasure,
      scrollLeft,
      measureWidth,
      viewportWidth,
      measuresArray.length,
    ]);

    const { startMeasure, endMeasure } = calculateVisibleRange();

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
        className="h-full bg-surface-0 z-10 styled-scrollbar overflow-auto relative"
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
          startMeasure={startMeasure}
          endMeasure={endMeasure}
          scrollRef={scrollRef}
          subdivisionWidth={subdivisionWidth}
          subdivisionsArray={subdivisionsArray}
          renderEveryFourthMeasure={renderEveryFourthMeasure}
          measureWidth={measureWidth}
          measuresArray={measuresArray}
        />

        <Clips
          scrollRef={scrollRef}
          startMeasure={startMeasure}
          endMeasure={endMeasure}
          setPlayheadLeft={setPlayheadLeft}
        />
        <Playhead height={mixer.topPanelHeight + 74} left={playheadLeft} />
        <TimelineHotKeysManager />
      </div>
    );
  }
);
