import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { useRef, useState } from "react";
import { Offsets, StateFlags } from "./types";

export const usePianoRollTimeline = () => {
  const [referenceNote, setReferenceNote] = useState<MidiNote | null>(null);

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

  const setOffset = (key: keyof typeof offsets, value: number) => {
    setOffsets((prev) => ({ ...prev, [key]: value }));
  };

  const setStateFlag = (key: keyof typeof state, value: boolean) => {
    setState((prev) => ({ ...prev, [key]: value }));
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
    timelineRef,
  };
};
