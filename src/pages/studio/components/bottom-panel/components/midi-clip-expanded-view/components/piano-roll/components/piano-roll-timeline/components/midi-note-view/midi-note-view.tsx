import { MidiClip } from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import {
  getColorFromVelocity,
  getOnMouseDown,
  getOnTouchStart,
  getTopValueFromPitch,
} from "./helpers";
import { observer } from "mobx-react-lite";
import React, { Dispatch, SetStateAction } from "react";
import { useUndoManager } from "@/pages/studio/hooks";
import { Offsets, StateFlags } from "../../hooks/use-piano-roll-timeline/types";

interface MidiNoteViewProps {
  offsets: Offsets;
  state: StateFlags;
  setStateFlag: (key: keyof StateFlags, value: boolean) => void;
  note: MidiNote;
  clip: MidiClip;
  clipStartOffsetPx: number;
  firstNoteRef?: React.RefObject<SVGRectElement>;
  setReferenceNote: Dispatch<SetStateAction<MidiNote | null>>;
  initialX: React.MutableRefObject<number>;
  initialY: React.MutableRefObject<number>;
}

export const MidiNoteView = observer(
  ({
    offsets,
    state,
    setStateFlag,
    note,
    clip,
    clipStartOffsetPx,
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
      setStateFlag,
      clip,
      note,
      undoManager,
      setReferenceNote
    );

    const onTouchStart = getOnTouchStart(
      initialX,
      initialY,
      setStateFlag,
      clip,
      note,
      undoManager,
      setReferenceNote
    );

    const handleExpandStartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setReferenceNote(note);
      setStateFlag("startExpanding", true);
    };

    const handleExpandEndClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setReferenceNote(note);
      setStateFlag("endExpanding", true);
    };

    const handleExpandStartTouch = (e: React.TouchEvent) => {
      e.stopPropagation();
      setReferenceNote(note);
      setStateFlag("startExpanding", true);
    };

    const handleExpandEndTouch = (e: React.TouchEvent) => {
      e.stopPropagation();
      setReferenceNote(note);
      setStateFlag("endExpanding", true);
    };

    const getAdjustedWidth = () => {
      if (selected) {
        if (state.startExpanding) {
          return width - offsets.startExpanding;
        } else if (state.endExpanding) {
          return width + offsets.endExpanding;
        }
      }

      return width;
    };

    const getAdjustedX = () => {
      if (selected) {
        if (state.startExpanding) {
          return left + offsets.startExpanding + 1;
        }
        return left + offsets.position + 1;
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
          onTouchStart={onTouchStart}
          onClick={(e) => e.stopPropagation()}
          x={adjustedX}
          width={adjustedWidth}
          height={17.5}
          y={selected ? offsets.drag * 17.5 + top : top}
          rx={2}
          style={{
            border: `1px solid ${generateRGBWithAlias(selected ? 0.7 : 0.5)}`,
          }}
          fill={generateRGBWithAlias(selected ? 0.7 : 0.3)}
        />

        <rect
          onMouseDown={handleExpandStartClick}
          onTouchStart={handleExpandStartTouch}
          className="cursor-col-resize"
          width={Math.min(8, adjustedWidth)}
          x={adjustedX}
          height={17.5}
          y={selected ? offsets.drag * 17.5 + top : top}
          stroke="transparent"
          fill="transparent"
        />
        <rect
          onMouseDown={handleExpandEndClick}
          onTouchStart={handleExpandEndTouch}
          className="cursor-col-resize"
          width={Math.min(8, adjustedWidth)}
          stroke="transparent"
          fill="transparent"
          x={adjustedX + adjustedWidth}
          height={17.5}
          y={selected ? offsets.drag * 17.5 + top : top}
        />
      </g>
    );
  }
);
