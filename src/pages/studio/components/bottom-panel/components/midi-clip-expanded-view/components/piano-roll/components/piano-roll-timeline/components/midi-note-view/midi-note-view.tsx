import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import {
  getColorFromVelocity,
  getOnMouseDown,
  getOnMouseMove,
  getOnMouseUp,
  getTopValueFromPitch,
} from "./helpers";
import { observer } from "mobx-react-lite";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useUndoManager } from "@/pages/studio/hooks";

interface MidiNoteViewProps {
  note: MidiNote;
  clip: MidiClip;
  clipStartOffsetPx: number;
  dragging: boolean;
  setDragging: React.Dispatch<SetStateAction<boolean>>;
  selectedNotesPositionOffset: number;
  setSelectedNotesPositionOffset: Dispatch<SetStateAction<number>>;
  selectedNotesDragOffset: number;
  setSelectedNotesDragOffset: Dispatch<SetStateAction<number>>;
  firstNoteRef?: React.RefObject<SVGRectElement>;
}

export const MidiNoteView = observer(
  ({
    note,
    clip,
    clipStartOffsetPx,
    dragging,
    setDragging,
    selectedNotesPositionOffset,
    setSelectedNotesPositionOffset,
    selectedNotesDragOffset,
    setSelectedNotesDragOffset,
    firstNoteRef,
  }: MidiNoteViewProps) => {
    const width = clip.samplesToPixels(note.off - note.on);
    const left = clip.samplesToPixels(note.on) + clipStartOffsetPx;
    const top = getTopValueFromPitch(note.note);
    const selected = clip.selectedNotes.includes(note);

    const { undoManager } = useUndoManager();

    const generateRGBWithAlias = (alias: number) => {
      const rgb = getColorFromVelocity(note.velocity);

      return `rgba(${[...rgb, alias].join(", ")})`;
    };

    const initialX = useRef(0);
    const initialY = useRef(0);

    const onMouseUp = getOnMouseUp(
      dragging,
      setDragging,
      selectedNotesPositionOffset,
      setSelectedNotesPositionOffset,
      selectedNotesDragOffset,
      setSelectedNotesDragOffset,
      note,
      clip,
      undoManager,
      initialX,
      initialY
    );
    const onMouseMove = getOnMouseMove(
      dragging,
      selected,
      note,
      clip,
      selectedNotesPositionOffset,
      setSelectedNotesPositionOffset,
      selectedNotesDragOffset,
      setSelectedNotesDragOffset,
      initialY,
      clipStartOffsetPx
    );

    const onMouseDown = getOnMouseDown(
      initialX,
      initialY,
      setDragging,
      clip,
      note,
      undoManager
    );

    useEffect(() => {
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
      return () => {
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousemove", onMouseMove);
      };
    }, [onMouseMove, onMouseUp]);

    return (
      <rect
        ref={firstNoteRef}
        id={note.id}
        onMouseDown={onMouseDown}
        onClick={(e) => e.stopPropagation()}
        x={(selected ? selectedNotesPositionOffset + left : left) + 1}
        width={width}
        height={17.5}
        y={selected ? selectedNotesDragOffset * 17.5 + top : top}
        rx={2}
        style={{
          border: `1px solid ${generateRGBWithAlias(selected ? 0.7 : 0.5)}`,
        }}
        fill={generateRGBWithAlias(selected ? 0.7 : 0.3)}
      />
    );
  }
);
