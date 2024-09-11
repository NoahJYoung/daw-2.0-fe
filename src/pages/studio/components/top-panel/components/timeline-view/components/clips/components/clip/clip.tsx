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
} from "react";
import { moveClipToNewTrack } from "../../helpers";

interface ClipProps {
  track: Track;
  clip: AudioClip | MidiClip;
  scrollRef: React.RefObject<HTMLDivElement>;
  selectedIndexOffset: number;
  setSelectedIndexOffset: Dispatch<SetStateAction<number>>;
  dragging: boolean;
  setDragging: Dispatch<SetStateAction<boolean>>;
}

const inBounds = (
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
    dragging,
    setDragging,
  }: ClipProps) => {
    const { timeline, mixer } = useAudioEngine();
    const undoManager = useUndoManager();
    const selected = mixer.selectedClips.includes(clip);

    const initialY = useRef<number>(0);
    const initialX = useRef<number>(0);
    const parentTrackIndex = mixer.tracks.indexOf(track);

    const onMouseDown = (e: React.MouseEvent) => {
      setDragging(true);
      initialY.current = e.clientY;
      initialX.current = e.clientX;

      undoManager.withGroup(() => {
        mixer.tracks.forEach((track) => {
          track.clips.forEach((clip) => clip.setStart(clip.start + 1));
        });
      });
    };

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        undoManager.withGroup(() => {
          if (!e.ctrlKey) {
            mixer.unselectAllClips();
          }

          track.selectClip(clip);
        });
      },
      [clip, mixer, track, undoManager]
    );

    const onMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!dragging || !selected) return;

        const movementXInSamples = timeline.pixelsToSamples(e.movementX);

        undoManager.withoutUndo(() => {
          mixer.selectedClips.forEach((selectedClip) => {
            const newStart = Math.max(
              0,
              selectedClip.start + movementXInSamples
            );
            selectedClip.setStart(newStart);
          });
        });

        const movementY = e.clientY - initialY?.current;
        const multiplier = Math.max(track.laneHeight);

        const clampedMultiplier = Math.max(80, Math.min(140, multiplier));

        const { selectedClips, tracks } = mixer;

        if (Math.abs(movementY) >= clampedMultiplier) {
          const direction = movementY > 0 ? 1 : -1;
          const newOffset = selectedIndexOffset + direction;

          if (inBounds(tracks, selectedClips, newOffset)) {
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

    const onMouseUp = useCallback(() => {
      undoManager.withoutUndo(() => {
        mixer.tracks.forEach((track) => {
          track.clips.forEach((clip) => clip.setStart(clip.start - 1));
        });
      });
      undoManager.withGroup(() => {
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
              selectedParentIndex + selectedIndexOffset
            );
          } else {
            throw new Error("No parent track found");
          }
        });
      });
      setSelectedIndexOffset(0);
      setDragging(false);
      initialY.current = 0;
    }, [
      mixer,
      selectedIndexOffset,
      setDragging,
      setSelectedIndexOffset,
      undoManager,
    ]);

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
        return mixer.getCombinedLaneHeightsAtIndex(
          parentTrackIndex + selectedIndexOffset
        );
      }

      return mixer.getCombinedLaneHeightsAtIndex(parentTrackIndex);
    };

    const getHeight = () => {
      if (selected && dragging) {
        return (
          mixer.tracks[parentTrackIndex + selectedIndexOffset]?.laneHeight - 2
        );
      }
      return track.laneHeight - 2;
    };

    const getColor = () => {
      if (selected && dragging) {
        return mixer.tracks[parentTrackIndex + selectedIndexOffset]?.color;
      }
      return track.color;
    };

    return (
      <div
        onMouseDown={onMouseDown}
        onClick={handleClick}
        key={clip.id}
        className="flex-shrink-0 rounded-xs"
        style={{
          opacity: selected ? 0.7 : 0.4,
          marginTop: 4,
          height: getHeight(),
          background: getColor(),
          border: `1px solid ${getColor()}`,
          top: getTop(),
          zIndex: 9,
          position: "absolute",
          left: clipLeft,
          cursor: dragging ? "grabbing" : "auto",
        }}
      >
        {clip?.type === "audio" && <AudioClipView track={track} clip={clip} />}
      </div>
    );
  }
);
