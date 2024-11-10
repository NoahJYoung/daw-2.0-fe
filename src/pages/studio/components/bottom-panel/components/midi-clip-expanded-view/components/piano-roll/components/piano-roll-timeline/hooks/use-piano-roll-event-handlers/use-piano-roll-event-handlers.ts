import { MidiClip } from "@/pages/studio/audio-engine/components";
import { Dispatch, SetStateAction } from "react";
import {
  getOnMouseMove,
  getOnMouseUp,
  getOnTouchEnd,
  getOnTouchMove,
} from "../../components/midi-note-view/helpers";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { Offsets, StateFlags } from "../use-piano-roll-timeline/types";
import * as Tone from "tone";

interface usePianoRollEventHandlers {
  offsets: Offsets;
  setOffset: (key: keyof Offsets, value: number) => void;
  state: StateFlags;
  setStateFlag: (key: keyof StateFlags, value: boolean) => void;
  selected: boolean;
  referenceNote: MidiNote | null;
  setReferenceNote: Dispatch<SetStateAction<MidiNote | null>>;
  setPlayheadLeft: Dispatch<SetStateAction<number>>;
  clip: MidiClip;
  initialX: React.MutableRefObject<number>;
  initialY: React.MutableRefObject<number>;
  timelineRef: React.RefObject<SVGSVGElement>;
  clipStartOffsetPx: number;
}

export const usePianoRollEventHandlers = ({
  offsets,
  setOffset,
  state,
  setStateFlag,
  selected,
  referenceNote,
  setReferenceNote,
  setPlayheadLeft,
  clip,
  initialX,
  initialY,
  timelineRef,
  clipStartOffsetPx,
}: usePianoRollEventHandlers) => {
  const { undoManager } = useUndoManager();
  const { timeline } = useAudioEngine();

  const onMouseUp = getOnMouseUp(
    offsets,
    setOffset,
    state,
    setStateFlag,
    referenceNote,
    clip,
    undoManager,
    setReferenceNote,
    initialX,
    initialY
  );

  const onTouchEnd = getOnTouchEnd(
    offsets,
    setOffset,
    state,
    setStateFlag,
    referenceNote,
    clip,
    undoManager,
    setReferenceNote,
    initialX,
    initialY
  );

  const onMouseMove = getOnMouseMove(
    offsets,
    setOffset,
    state,
    selected,
    referenceNote,
    clip,
    initialY,
    clipStartOffsetPx
  );

  const onTouchMove = getOnTouchMove(
    offsets,
    setOffset,
    state,
    selected,
    referenceNote,
    clip,
    initialX,
    initialY,
    clipStartOffsetPx
  );

  const onClick = (e: React.MouseEvent) => {
    if (!e.ctrlKey) {
      undoManager.withGroup("UNSELECT ALL NOTES", () => {
        clip.unselectAllNotes();
      });
    }
    undoManager.withoutUndo(() => {
      if (timelineRef.current) {
        const xOffset = timelineRef.current.getBoundingClientRect().x;
        const xValue = e.clientX - xOffset + timelineRef.current.scrollLeft;
        const seconds = clip.snapToGrid
          ? Tone.Time(xValue * clip.samplesPerPixel, "samples").quantize(
              clip.subdivision
            )
          : Tone.Time(
              xValue * clip.samplesPerPixel +
                Tone.Time(clip.startMeasure, "m").toSamples(),
              "samples"
            ).toSeconds();
        Tone.getTransport().seconds = seconds;

        timeline.setSeconds(seconds);

        const pixels =
          Tone.Time(Tone.getTransport().seconds, "s").toSamples() /
          clip.samplesPerPixel;
        setPlayheadLeft(pixels);
      }
    });
  };

  return { onMouseUp, onTouchEnd, onMouseMove, onTouchMove, onClick };
};
