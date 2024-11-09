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
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
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
  selectedNotesStartExpandingOffset: number;
  setSelectedNotesStartExpandingOffset: Dispatch<SetStateAction<number>>;
  selectedNotesEndExpandingOffset: number;
  setSelectedNotesEndExpandingOffset: Dispatch<SetStateAction<number>>;
  startExpanding: boolean;
  setStartExpanding: Dispatch<SetStateAction<boolean>>;
  endExpanding: boolean;
  setEndExpanding: Dispatch<SetStateAction<boolean>>;
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
    selectedNotesStartExpandingOffset,
    setSelectedNotesStartExpandingOffset,
    selectedNotesEndExpandingOffset,
    setSelectedNotesEndExpandingOffset,
    startExpanding,
    setStartExpanding,
    endExpanding,
    setEndExpanding,
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
      startExpanding,
      setStartExpanding,
      endExpanding,
      setEndExpanding,
      selectedNotesStartExpandingOffset,
      setSelectedNotesStartExpandingOffset,
      selectedNotesEndExpandingOffset,
      setSelectedNotesEndExpandingOffset,
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
      selectedNotesStartExpandingOffset,
      setSelectedNotesStartExpandingOffset,
      selectedNotesEndExpandingOffset,
      setSelectedNotesEndExpandingOffset,
      startExpanding,
      endExpanding,
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

    const expandStart = (e: React.MouseEvent) => {
      e.stopPropagation();
      setStartExpanding(true);
    };

    const expandEnd = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEndExpanding(true);
    };

    useEffect(() => {
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
      return () => {
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousemove", onMouseMove);
      };
    }, [onMouseMove, onMouseUp]);

    const getAdjustedWidth = () => {
      if (selected) {
        if (startExpanding) {
          return width - selectedNotesStartExpandingOffset;
        } else if (endExpanding) {
          return width + selectedNotesEndExpandingOffset;
        }
      }

      return width;
    };

    const getAdjustedX = () => {
      if (selected) {
        if (startExpanding) {
          return left + selectedNotesStartExpandingOffset + 1;
        }
        return left + selectedNotesPositionOffset + 1;
      }
      return left + 1;
    };

    const adjustedWidth = getAdjustedWidth();
    const adjustedX = getAdjustedX();

    return (
      <g>
        <rect
          ref={firstNoteRef}
          id={note.id}
          onMouseDown={onMouseDown}
          onClick={(e) => e.stopPropagation()}
          x={adjustedX}
          width={adjustedWidth}
          height={17.5}
          y={selected ? selectedNotesDragOffset * 17.5 + top : top}
          rx={2}
          style={{
            border: `1px solid ${generateRGBWithAlias(selected ? 0.7 : 0.5)}`,
          }}
          fill={generateRGBWithAlias(selected ? 0.7 : 0.3)}
        />

        <rect
          onMouseDown={expandStart}
          className="cursor-col-resize"
          width={Math.min(8, adjustedWidth)}
          x={adjustedX}
          height={17.5}
          y={selected ? selectedNotesDragOffset * 17.5 + top : top}
          stroke="transparent"
          fill="transparent"
        />
        <rect
          onMouseDown={expandEnd}
          className="cursor-col-resize"
          width={Math.min(8, adjustedWidth)}
          stroke="transparent"
          fill="transparent"
          x={adjustedX + adjustedWidth}
          height={17.5}
          y={selected ? selectedNotesDragOffset * 17.5 + top : top}
        />
      </g>
    );
  }
);
