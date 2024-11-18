/* eslint-disable react-hooks/exhaustive-deps */
import { observer } from "mobx-react-lite";
import { Clips, Grid, Playhead, TopBar } from "./components";
import {
  useAudioEngine,
  useRequestAnimationFrame,
  useUndoManager,
} from "@/pages/studio/hooks";
import {
  useMemo,
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
} from "react";
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
    const { undoManager } = useUndoManager();
    const { timeline, mixer } = audioEngine;
    const { measures, timeSignature } = timeline;

    const [scrollLeft, setScrollLeft] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(0);

    const playheadRef = useRef<HTMLDivElement>(null);
    const setPlayheadLeft = (pixels: number) => {
      if (playheadRef.current) {
        playheadRef.current.style.transform = `translateX(${pixels}px)`;
      }
    };

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

    const smallestSubdivision = useMemo(
      () => findSmallestSubdivision(timeline),
      [timeline, timeline.samplesPerPixel, timeline.subdivision]
    );

    const subdivisionsPerBeat = useMemo(
      () => subdivisionToQuarterMap[smallestSubdivision],
      [smallestSubdivision, timeline.samplesPerPixel]
    );

    const subdivisionsPerMeasure = useMemo(
      () => subdivisionsPerBeat * timeSignature,
      [subdivisionsPerBeat, timeSignature, timeline.samplesPerPixel]
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
      [timeline, timeline.samplesPerPixel, timeline.bpm]
    );

    const measureWidth =
      Math.round((beatWidth * timeline.timeSignature + Number.EPSILON) * 100) /
      100;

    const subdivisionWidth = measureWidth / subdivisionsPerMeasure;

    const renderEveryFourthMeasure = beatWidth * timeSignature < 40;

    const handleClick = (e: React.MouseEvent) => {
      undoManager.withoutUndo(() => {
        if (e.ctrlKey) {
          return;
        }
        if (scrollRef.current) {
          const xOffset = scrollRef.current.getBoundingClientRect().x;
          const xValue = e.clientX - xOffset + scrollRef.current.scrollLeft;
          const seconds = timeline.snapToGrid
            ? Tone.Time(xValue * timeline.samplesPerPixel, "samples").quantize(
                timeline.subdivision
              )
            : Tone.Time(
                xValue * timeline.samplesPerPixel,
                "samples"
              ).toSeconds();
          Tone.getTransport().seconds = seconds;
          timeline.setSeconds(seconds);

          const pixels =
            Tone.Time(Tone.getTransport().seconds, "s").toSamples() /
            timeline.samplesPerPixel;
          setPlayheadLeft(pixels);
        }
      });
    };

    useRequestAnimationFrame(
      () => {
        const pixels = timeline.samplesToPixels(
          Tone.Time(Tone.getTransport().seconds, "s").toSamples()
        );
        setPlayheadLeft(pixels);
      },
      {
        enabled:
          audioEngine.state === AudioEngineState.playing ||
          audioEngine.state === AudioEngineState.recording,
      }
    );

    useLayoutEffect(() => {
      undoManager.withoutUndo(() => {
        timeline.setSeconds(Tone.getTransport().seconds);
      });
    }, [audioEngine.state]);

    useLayoutEffect(() => {
      setPlayheadLeft(timeline.positionInPixels);
    }, [timeline.positionInPixels]);

    const adjustScrollToZoomChange = (
      timeline: Timeline,
      containerRef: React.RefObject<HTMLDivElement>
    ) => {
      const newScrollLeft =
        timeline.positionInPixels -
        scrollRef.current!.getBoundingClientRect().width / 2;
      if (containerRef.current) {
        containerRef.current.scrollLeft = newScrollLeft;
      }
    };

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
    }, [timeline]);

    useLayoutEffect(() => {
      const pixels =
        Tone.Time(Tone.getTransport().seconds, "s").toSamples() /
        timeline.samplesPerPixel;

      setPlayheadLeft(pixels);
    }, [timeline.samplesPerPixel]);

    const totalWidth = measureWidth * measures;

    return (
      <div
        onClick={handleClick}
        onScroll={onScroll}
        ref={scrollRef}
        style={{ width: totalWidth }}
        className="h-full bg-surface-0 z-20 styled-scrollbar overflow-auto relative"
      >
        <TopBar
          totalWidth={totalWidth}
          renderEveryFourthMeasure={renderEveryFourthMeasure}
          subdivisionsArray={subdivisionsArray}
          measuresArray={measuresArray}
          measureWidth={measureWidth}
          subdivisionWidth={subdivisionWidth}
          subdivisionsPerBeat={subdivisionsPerBeat}
        />

        <Grid
          totalWidth={totalWidth}
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
          scrollLeft={scrollLeft}
          totalWidth={totalWidth}
          measureWidth={measureWidth}
          totalMeasures={measures}
          scrollRef={scrollRef}
          startMeasure={startMeasure}
          endMeasure={endMeasure}
          setPlayheadLeft={setPlayheadLeft}
        />
        <Playhead ref={playheadRef} height={mixer.topPanelHeight + 154} />
      </div>
    );
  }
);
