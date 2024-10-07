import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { Clip } from "./components";
import { PlaceholderClip } from "./components/clip/components";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import { Clip as ClipData } from "@/pages/studio/audio-engine/components/types";
import { getTimelineMenuActions } from "./helpers";

import * as Tone from "tone";

interface ClipsProps {
  startMeasure: number;
  endMeasure: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  scrollLeft: number;
  setPlayheadLeft: Dispatch<SetStateAction<number>>;
  measureWidth: number;
  totalMeasures: number;
  totalWidth: number;
}

export const Clips = observer(
  ({
    startMeasure,
    endMeasure,
    scrollRef,
    scrollLeft,
    setPlayheadLeft,
    totalWidth,
  }: ClipsProps) => {
    const audioEngine = useAudioEngine();
    const { undoManager } = useUndoManager();
    const [selectedIndexOffset, setSelectedIndexOffset] = useState(0);
    const [selectedXOffset, setSelectedXOffset] = useState(0);
    const [loopOffset, setLoopOffset] = useState<number>(0);
    const [isLooping, setIsLooping] = useState(false);
    const [referenceClip, setReferenceClip] = useState<ClipData | null>(null);
    const [dragging, setDragging] = useState(false);

    const [placeholderClipPosition, setPlaceholderClipPosition] = useState<
      number | null
    >(null);

    const { state, mixer } = audioEngine;

    useEffect(() => {
      if (state === AudioEngineState.recording) {
        setPlaceholderClipPosition(Tone.getTransport().seconds);
      } else {
        setPlaceholderClipPosition(null);
      }
    }, [state]);

    const handleClick = (e: React.MouseEvent) => {
      if (!e.ctrlKey) {
        undoManager.withGroup(
          "UNSELECT ALL CLIPS, SELECT TRACK AT Y COORDINATES",
          () => {
            mixer.unselectAllClips();
            mixer.unselectAllTracks();

            if (scrollRef.current) {
              const trackToSelect = mixer.getTrackAtYPosition(
                e.clientY + scrollRef.current.scrollTop - 72
              );
              if (trackToSelect) {
                mixer.selectTrack(trackToSelect);
              }
            }
          }
        );
      } else {
        e.stopPropagation();
        undoManager.withGroup("SELECT TRACK AT Y COORDINATES", () => {
          if (scrollRef.current) {
            const trackToSelect = mixer.getTrackAtYPosition(
              e.clientY + scrollRef.current.scrollTop - 72
            );
            if (trackToSelect) {
              const selected = mixer.selectedTracks.includes(trackToSelect);
              if (selected) {
                mixer.unselectTrack(trackToSelect);
              } else {
                mixer.selectTrack(trackToSelect);
              }
            }
          }
        });
      }
    };

    const shouldRenderClip = (clip: ClipData) => {
      const clipStartMeasure = parseInt(
        Tone.Time(clip.start, "samples").toBarsBeatsSixteenths().split(":")[0]
      );
      const clipEndMeasure = parseInt(
        Tone.Time(clip.end + clip.loopSamples, "samples")
          .toBarsBeatsSixteenths()
          .split(":")[0]
      );
      if (clipEndMeasure >= startMeasure && clipStartMeasure <= endMeasure) {
        return true;
      }
      return false;
    };

    return (
      <StudioContextMenu
        disabled={
          state === AudioEngineState.playing ||
          state === AudioEngineState.recording
        }
        items={getTimelineMenuActions(audioEngine, undoManager)}
      >
        <div
          onContextMenu={(e) => {
            if (
              state === AudioEngineState.playing ||
              state === AudioEngineState.recording
            ) {
              e.preventDefault();
            }
          }}
          onClick={handleClick}
          className="absolute flex flex-col"
          style={{
            width: totalWidth,
            height: mixer.topPanelHeight + 80,
            top: 72,
          }}
        >
          {mixer.tracks.map((track) => (
            <div key={track.id} className="flex flex-shrink-0 absolute">
              {state === AudioEngineState.recording && track.active && (
                <PlaceholderClip
                  track={track}
                  startPosition={placeholderClipPosition}
                />
              )}
              {track.clips.map((clip) =>
                shouldRenderClip(clip) ? (
                  <Clip
                    isLooping={isLooping}
                    setIsLooping={setIsLooping}
                    setLoopOffset={setLoopOffset}
                    loopOffset={loopOffset}
                    scrollLeft={scrollLeft}
                    selectedOffset={selectedXOffset}
                    setSelectedOffset={setSelectedXOffset}
                    setPlayheadLeft={setPlayheadLeft}
                    dragging={dragging}
                    setDragging={setDragging}
                    setSelectedIndexOffset={setSelectedIndexOffset}
                    selectedIndexOffset={selectedIndexOffset}
                    scrollRef={scrollRef}
                    key={clip.id}
                    track={track}
                    clip={clip}
                    referenceClip={referenceClip}
                    setReferenceClip={setReferenceClip}
                  />
                ) : null
              )}
            </div>
          ))}
        </div>
      </StudioContextMenu>
    );
  }
);
