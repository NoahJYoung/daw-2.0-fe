import {
  AudioClip,
  MidiClip,
  Track,
} from "@/pages/studio/audio-engine/components";
import { Clip as ClipData } from "@/pages/studio/audio-engine/components/types";
import { observer } from "mobx-react-lite";
import { AudioClipView } from "./components";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import {
  useCallback,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import * as Tone from "tone";
import { moveClipToNewTrack } from "../../helpers";

interface ClipProps {
  track: Track;
  clip: AudioClip | MidiClip;
  scrollRef: React.RefObject<HTMLDivElement>;
  selectedIndexOffset: number;
  setSelectedIndexOffset: Dispatch<SetStateAction<number>>;
  dragging: boolean;
  setDragging: Dispatch<SetStateAction<boolean>>;
  setPlayheadLeft: (pixels: number) => void;
}

const inBoundsX = (selectedClips: ClipData[], movementXInSamples: number) => {
  return !selectedClips.some(
    (selectedClip) => selectedClip.start + movementXInSamples < 0
  );
};

const inBoundsY = (
  tracks: Track[],
  selectedClips: ClipData[],
  offset: number
) => {
  if (
    selectedClips.some((selectedClip) => {
      const parentTrackIndex = tracks.findIndex(
        (track) => track.id === selectedClip.trackId
      );
      return (
        parentTrackIndex + offset >= tracks.length ||
        parentTrackIndex + offset < 0
      );
    })
  ) {
    return false;
  }
  return true;
};

export const Clip = observer(
  ({
    clip,
    track,
    selectedIndexOffset,
    setSelectedIndexOffset,
    scrollRef,
    dragging,
    setDragging,
    setPlayheadLeft,
  }: ClipProps) => {
    const { timeline, mixer } = useAudioEngine();
    const undoManager = useUndoManager();
    const selected = mixer.selectedClips.includes(clip);

    const initialY = useRef<number>(0);
    const initialX = useRef<number>(0);
    const parentTrackIndex = mixer.tracks.indexOf(track);

    const onMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.button !== 2) {
        setDragging(true);
      }
      initialY.current = e.clientY;
      initialX.current = e.clientX;

      if (e.button !== 2) {
        undoManager.withGroup("UNSELECT ALL AND SELECT ONE", () => {
          if (!e.ctrlKey) {
            mixer.unselectAllClips();
          }

          track.selectClip(clip);
        });
      }

      undoManager.withGroup("MOVE CLIPS PRE", () => {
        mixer.tracks.forEach((track) => {
          track.clips.forEach((selectedTrackclip) =>
            selectedTrackclip.setStart(selectedTrackclip.start + 1)
          );
        });
      });
    };
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.ctrlKey) {
          return;
        }
        undoManager.withoutUndo(() => {
          if (scrollRef.current) {
            const xOffset = scrollRef.current.getBoundingClientRect().x;
            const xValue = e.clientX - xOffset + scrollRef.current.scrollLeft;
            timeline.setSecondsFromPixels(xValue);

            setPlayheadLeft(timeline.positionInPixels);
          }
        });
      },
      [scrollRef, setPlayheadLeft, timeline, undoManager]
    );

    const onMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!dragging || !selected) return;

        const movementXInSamples = timeline.pixelsToSamples(
          Math.abs(e.movementX) > 1 ? e.movementX : 0
        );

        if (inBoundsX(mixer.selectedClips, movementXInSamples)) {
          undoManager.withoutUndo(() => {
            mixer.selectedClips.forEach((selectedClip) => {
              const newStart = Math.max(
                0,
                selectedClip.start + movementXInSamples
              );
              selectedClip.setStart(newStart);
            });
          });
        }

        const movementY = e.clientY - initialY?.current;
        const threshold = track.laneHeight * 0.75;

        if (Math.abs(movementY) < 20) {
          return;
        }

        const clampedThreshold = Math.max(80, Math.min(140, threshold));

        const { selectedClips, tracks } = mixer;

        if (Math.abs(movementY) >= clampedThreshold) {
          const direction = movementY > 0 ? 1 : -1;
          const newOffset = selectedIndexOffset + direction;

          if (inBoundsY(tracks, selectedClips, newOffset)) {
            setSelectedIndexOffset(newOffset);
            initialY.current = e.clientY;
          }
        }
      },
      [
        dragging,
        selected,
        timeline,
        undoManager,
        track.laneHeight,
        mixer,
        selectedIndexOffset,
        setSelectedIndexOffset,
      ]
    );

    const onMouseUp = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation();
        undoManager.withGroup("MOVE CLIPS POST", () => {
          mixer.tracks.forEach((track) => {
            track.clips.forEach((clip) => clip.setStart(clip.start - 1));
          });
        });
        if (parentTrackIndex !== parentTrackIndex + selectedIndexOffset) {
          undoManager.withGroup("MOVE CLIPS TO NEW TRACK", () => {
            mixer.selectedClips.forEach((selectedClip) => {
              const selectedParentIndex = mixer.tracks.findIndex(
                (track) => track.id === selectedClip.trackId
              );
              if (selectedParentIndex !== -1) {
                moveClipToNewTrack(
                  selectedClip,
                  mixer,
                  undoManager,
                  selectedParentIndex,
                  selectedParentIndex + selectedIndexOffset,
                  timeline.samplesPerPixel
                );
              } else {
                throw new Error("No parent track found");
              }
            });
          });
        }

        setSelectedIndexOffset(0);
        setDragging(false);
        initialY.current = 0;
        initialX.current = 0;
      },
      [
        mixer,
        parentTrackIndex,
        selectedIndexOffset,
        setDragging,
        setSelectedIndexOffset,
        timeline.samplesPerPixel,
        undoManager,
      ]
    );

    const clipLeft = timeline.samplesToPixels(clip.start);

    useEffect(() => {
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
      return () => {
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousemove", onMouseMove);
      };
    }, [onMouseMove, onMouseUp]);

    const getTop = () => {
      if (selected && dragging) {
        return (
          mixer.getCombinedLaneHeightsAtIndex(
            parentTrackIndex + selectedIndexOffset
          ) + 1
        );
      }

      return mixer.getCombinedLaneHeightsAtIndex(parentTrackIndex) + 1;
    };

    const getHeight = () => {
      if (selected && dragging) {
        return (
          mixer.tracks[parentTrackIndex + selectedIndexOffset]?.laneHeight - 4
        );
      }
      return track.laneHeight - 4;
    };

    const getColor = () => {
      if (selected && dragging) {
        return mixer.tracks[parentTrackIndex + selectedIndexOffset]?.color;
      }
      return track.color;
    };

    const clipInfoString = useMemo(() => {
      return `${track.name} | ${Tone.Time(
        clip.start,
        "samples"
      ).toBarsBeatsSixteenths()}`;
    }, [clip.start, track.name]);

    const clipWidth = useMemo(
      () => timeline.samplesToPixels(clip.length),
      [clip.length, timeline.samplesPerPixel]
    );

    const currentDragTrack =
      dragging &&
      inBoundsY(mixer.tracks, mixer.selectedClips, selectedIndexOffset)
        ? mixer.tracks[parentTrackIndex + selectedIndexOffset]
        : track;

    return (
      <div
        onMouseDown={onMouseDown}
        onClick={handleClick}
        key={clip.id}
        className=" flex flex-col flex-shrink-0 rounded-xl gap-1 pb-[4px]"
        style={{
          opacity: selected ? 0.7 : 0.4,
          marginTop: 2,
          height: getHeight(),
          background: getColor(),
          top: getTop(),
          zIndex: 9,
          position: "absolute",
          left: clipLeft,
          cursor: dragging ? "grabbing" : "auto",
        }}
      >
        <p
          style={{ maxWidth: clipWidth }}
          className="text-black pl-[6px] text-xs select-none whitespace-nowrap max-w-full text-ellipsis overflow-hidden"
        >
          {clipInfoString}
        </p>
        {clip?.type === "audio" && (
          <AudioClipView track={currentDragTrack || track} clip={clip} />
        )}
      </div>
    );
  }
);
