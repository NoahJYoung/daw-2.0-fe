import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import {
  getColorFromVelocity,
  getOnMouseDown,
  getTopValueFromPitch,
} from "./helpers";
import { observer } from "mobx-react-lite";
import React, { Dispatch, SetStateAction } from "react";
import { useUndoManager } from "@/pages/studio/hooks";

interface MidiNoteViewProps {
  note: MidiNote;
  clip: MidiClip;
  clipStartOffsetPx: number;
  setDragging: React.Dispatch<SetStateAction<boolean>>;
  selectedNotesPositionOffset: number;
  selectedNotesDragOffset: number;
  selectedNotesStartExpandingOffset: number;
  selectedNotesEndExpandingOffset: number;
  startExpanding: boolean;
  setStartExpanding: Dispatch<SetStateAction<boolean>>;
  endExpanding: boolean;
  setEndExpanding: Dispatch<SetStateAction<boolean>>;
  firstNoteRef?: React.RefObject<SVGRectElement>;
  setReferenceNote: Dispatch<SetStateAction<MidiNote | null>>;
  initialX: React.MutableRefObject<number>;
  initialY: React.MutableRefObject<number>;
}

export const MidiNoteView = observer(
  ({
    note,
    clip,
    clipStartOffsetPx,
    setDragging,
    selectedNotesPositionOffset,
    selectedNotesDragOffset,
    selectedNotesStartExpandingOffset,
    selectedNotesEndExpandingOffset,
    startExpanding,
    setStartExpanding,
    endExpanding,
    setEndExpanding,
    firstNoteRef,
    setReferenceNote,
    initialX,
    initialY,
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

    const onMouseDown = getOnMouseDown(
      initialX,
      initialY,
      setDragging,
      clip,
      note,
      undoManager,
      setReferenceNote
    );

    const expandStart = (e: React.MouseEvent) => {
      e.stopPropagation();
      setReferenceNote(note);
      setStartExpanding(true);
    };

    const expandEnd = (e: React.MouseEvent) => {
      e.stopPropagation();
      setReferenceNote(note);
      setEndExpanding(true);
    };

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
