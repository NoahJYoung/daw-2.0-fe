import { MidiClip } from "@/pages/studio/audio-engine/components";
import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";
import { observer } from "mobx-react-lite";
import { MidiNoteView } from "./components";
import * as Tone from "tone";
import { SetStateAction, useEffect, useRef } from "react";
import { usePianoRollMenuActions } from "../../hooks";
import { useAudioEngine } from "@/pages/studio/hooks";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { usePianoRollEventHandlers, usePianoRollTimeline } from "./hooks";
import { renderGridLanes } from "./components/midi-note-view/helpers/render-grid-lanes";
import { renderGrid } from "./components/midi-note-view/helpers";

interface PianoRollTimelineProps {
  clip: MidiClip;
  keys: PitchNameTuple[];
  width: number;
  subdivisionWidth: number;
  subdivisionsArray: number[];
  renderEveryFourthMeasure: boolean;
  measuresArray: number[];
  measureWidth: number;
  startMeasure: number;
  endMeasure: number;
  timelineContainerRef: React.RefObject<HTMLDivElement>;
  setPlayheadLeft: React.Dispatch<SetStateAction<number>>;
}
export const PianoRollTimeline = observer(
  ({
    keys,
    width,
    measuresArray,
    measureWidth,
    subdivisionsArray,
    subdivisionWidth,
    renderEveryFourthMeasure,
    startMeasure,
    timelineContainerRef,
    clip,
    setPlayheadLeft,
  }: PianoRollTimelineProps) => {
    const {
      referenceNote,
      setReferenceNote,
      offsets,
      setOffset,
      state,
      setStateFlag,
      initialX,
      initialY,
      timelineRef,
      setScrollLeft,
      isNoteVisible,
    } = usePianoRollTimeline(timelineContainerRef);

    const audioEngine = useAudioEngine();
    const { mixer } = audioEngine;
    const menuActions = usePianoRollMenuActions(clip);

    const clipStartOffsetPx = clip.samplesToPixels(
      clip.start - Tone.Time(clip.startMeasure, "m").toSamples()
    );

    const firstNoteRef = useRef<SVGRectElement>(null);

    const selected =
      !!referenceNote && clip.selectedNotes.includes(referenceNote);

    const { onMouseUp, onTouchEnd, onTouchMove, onMouseMove, onClick } =
      usePianoRollEventHandlers({
        setPlayheadLeft,
        timelineRef,
        offsets,
        setOffset,
        state,
        setStateFlag,
        selected,
        referenceNote,
        setReferenceNote,
        clip,
        initialX,
        initialY,
        clipStartOffsetPx,
      });

    const { dragging, startExpanding, endExpanding } = state;
    const expanding = startExpanding || endExpanding;

    useEffect(() => {
      const preventScroll = (e: Event) => {
        if (e.cancelable) e.preventDefault();
      };

      if (dragging || expanding) {
        document.addEventListener("wheel", preventScroll, {
          passive: false,
        });
        document.addEventListener("touchmove", preventScroll, {
          passive: false,
        });
      }

      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchend", onTouchEnd);

      return () => {
        document.removeEventListener("wheel", preventScroll);
        document.removeEventListener("touchmove", preventScroll);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.addEventListener("touchmove", onTouchMove);
      };
    }, [
      dragging,
      expanding,
      onMouseMove,
      onMouseUp,
      onTouchEnd,
      onTouchMove,
      state,
    ]);

    useEffect(() => {
      const expanding = startExpanding || endExpanding;
      if (dragging || expanding) {
        document.body.classList.add("touch-none");
      } else {
        document.body.classList.remove("touch-none");
      }
    }, [dragging, endExpanding, startExpanding]);

    const clipWidthPx = clip.samplesToPixels(clip.length);
    const parentTrack = mixer.tracks.find((track) => track.id === clip.trackId);

    const [r, g, b] = parentTrack?.rgb ?? [175, 175, 175];

    const fill = `rgba(${r}, ${g}, ${b}, 0.1)`;
    const stroke = `rgba(${r}, ${g}, ${b}, 0.2)`;

    const handleScroll = () => {
      if (timelineRef.current) {
        setScrollLeft(timelineRef.current.scrollLeft);
      }
    };

    return (
      <StudioContextMenu
        disabled={
          audioEngine.state === AudioEngineState.playing ||
          audioEngine.state === AudioEngineState.recording
        }
        items={menuActions}
      >
        <svg
          ref={timelineRef}
          width={width}
          className="flex-shrink-0 overflow-x-auto relative"
          height="1890px"
          onClick={onClick}
          onScroll={handleScroll}
        >
          {renderGridLanes(width, 17.5, keys.length)}
          {renderGrid(
            measuresArray,
            measureWidth,
            subdivisionsArray,
            subdivisionWidth,
            1890,
            renderEveryFourthMeasure,
            startMeasure
          )}
          <rect
            rx={4}
            stroke={stroke}
            fill={fill}
            x={clipStartOffsetPx}
            y={0}
            height={1890}
            width={clipWidthPx}
          />
          {clip.events.map((note, i) =>
            isNoteVisible(note, clip) ? (
              <MidiNoteView
                key={note.id}
                offsets={offsets}
                state={state}
                setStateFlag={setStateFlag}
                setReferenceNote={setReferenceNote}
                initialX={initialX}
                initialY={initialY}
                firstNoteRef={i === 0 ? firstNoteRef : undefined}
                clipStartOffsetPx={clipStartOffsetPx}
                note={note}
                clip={clip}
              />
            ) : null
          )}
        </svg>
      </StudioContextMenu>
    );
  }
);
