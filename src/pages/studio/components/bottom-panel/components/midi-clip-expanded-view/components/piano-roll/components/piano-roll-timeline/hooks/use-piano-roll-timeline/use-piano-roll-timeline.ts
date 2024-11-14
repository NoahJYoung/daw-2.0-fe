import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { useEffect, useRef, useState } from "react";
import { Offsets, StateFlags } from "./types";
import * as Tone from "tone";
import { MidiClip } from "@/pages/studio/audio-engine/components";

export const usePianoRollTimeline = (
  timelineContainerRef: React.RefObject<HTMLDivElement>
) => {
  const [referenceNote, setReferenceNote] = useState<MidiNote | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  const [offsets, setOffsets] = useState<Offsets>({
    drag: 0,
    position: 0,
    startExpanding: 0,
    endExpanding: 0,
  });
  const [state, setState] = useState<StateFlags>({
    dragging: false,
    startExpanding: false,
    endExpanding: false,
  });

  const timelineRef = useRef<SVGSVGElement>(null);

  const initialX = useRef(0);
  const initialY = useRef(0);

  console.log(viewportWidth);

  useEffect(() => {
    const updateViewportWidth = () => {
      if (timelineContainerRef.current) {
        setViewportWidth(timelineContainerRef.current.clientWidth);
      }
    };

    const handleScroll = () => {
      if (timelineContainerRef.current) {
        setScrollLeft(timelineContainerRef.current.scrollLeft);
      }
    };

    const scroll = timelineContainerRef.current;

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
  }, [timelineContainerRef]);

  const setOffset = (
    key: keyof typeof offsets,
    value: number | ((x: number) => number)
  ) => {
    if (typeof value === "function") {
      setOffsets((prev) => ({ ...prev, [key]: value(prev[key]) }));
    } else {
      setOffsets((prev) => ({ ...prev, [key]: value }));
    }
  };

  const setStateFlag = (key: keyof typeof state, value: boolean) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const isNoteVisible = (note: MidiNote, clip: MidiClip) => {
    if (!timelineContainerRef.current) {
      return false;
    }
    const clipStartOffsetPx = clip.samplesToPixels(
      clip.start - Tone.Time(clip.startMeasure, "m").toSamples()
    );

    const noteStartInPixels = clip.samplesToPixels(note.on);
    const noteEndInPixels = clip.samplesToPixels(note.off);

    const visibleRangeStart =
      clipStartOffsetPx + timelineContainerRef.current.scrollLeft;
    const visibleRangeEnd = visibleRangeStart + viewportWidth;

    const noteVisible =
      noteStartInPixels <= visibleRangeEnd &&
      noteEndInPixels >= visibleRangeStart;

    return noteVisible;
  };

  return {
    referenceNote,
    setReferenceNote,
    offsets,
    setOffset,
    state,
    setStateFlag,
    initialX,
    initialY,
    scrollLeft,
    setScrollLeft,
    timelineRef,
    isNoteVisible,
  };
};
