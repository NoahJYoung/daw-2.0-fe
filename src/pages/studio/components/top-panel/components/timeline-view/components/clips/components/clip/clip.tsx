import {
  AudioClip,
  MidiClip,
  Track,
} from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { AudioClipView } from "./components";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { useState, useCallback, useEffect, useRef } from "react";
import { moveClipToNewTrack } from "../../helpers";

interface ClipProps {
  track: Track;
  clip: AudioClip | MidiClip;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const Clip = observer(({ clip, track }: ClipProps) => {
  const [dragging, setDragging] = useState(false);
  const { timeline, mixer } = useAudioEngine();
  const undoManager = useUndoManager();
  const selected = mixer.selectedClips.includes(clip);

  const initialY = useRef<number>(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    initialY.current = e.clientY;
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

  const [tempTrackIndex, setTempTrackIndex] = useState(
    mixer.tracks.indexOf(track)
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;

      const movementXInSamples = timeline.pixelsToSamples(e.movementX);

      undoManager.withoutUndo(() => {
        if (selected) {
          mixer.selectedClips.forEach((selectedClip) => {
            const newStart = Math.max(
              0,
              selectedClip.start + movementXInSamples
            );
            selectedClip.setStart(newStart);
          });
        } else {
          const newStart = Math.max(0, clip.start + movementXInSamples);
          clip.setStart(newStart);
        }
      });

      const movementY = e.clientY - initialY?.current;

      const multiplier = mixer.tracks[tempTrackIndex].laneHeight;

      requestAnimationFrame(() => {
        if (movementY > multiplier) {
          if (tempTrackIndex + 1 < mixer.tracks.length) {
            setTempTrackIndex((prev) => prev + 1);
          } else {
            setTempTrackIndex(mixer.tracks.length - 1);
          }
          initialY.current = e.clientY;
        } else if (movementY < -multiplier) {
          if (tempTrackIndex - 1 >= 0) {
            setTempTrackIndex((prev) => prev - 1);
          } else {
            setTempTrackIndex(0);
          }
          initialY.current = e.clientY;
        }
      });
    },
    [
      dragging,
      timeline,
      undoManager,
      mixer.tracks,
      mixer.selectedClips,
      tempTrackIndex,
      selected,
      clip,
    ]
  );

  const onMouseUp = useCallback(() => {
    undoManager.withoutUndo(() => {
      mixer.tracks.forEach((track) => {
        track.clips.forEach((clip) => clip.setStart(clip.start - 1));
      });
    });
    const oldIndex = mixer.tracks.indexOf(track);
    if (tempTrackIndex !== oldIndex) {
      moveClipToNewTrack(clip, mixer, undoManager, oldIndex, tempTrackIndex);
    }
    setTempTrackIndex(oldIndex);
    setDragging(false);
    initialY.current = 0;
  }, [clip, mixer, tempTrackIndex, track, undoManager]);

  const clipLeft = timeline.samplesToPixels(clip.start);

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={handleClick}
      key={clip.id}
      className="flex-shrink-0 rounded-xs"
      style={{
        opacity: selected ? 0.7 : 0.4,
        marginTop: 4,
        height: dragging
          ? mixer.tracks[tempTrackIndex].laneHeight - 2
          : track.laneHeight - 2,
        background: dragging ? mixer.tracks[tempTrackIndex].color : track.color,
        border: `1px solid ${
          dragging ? mixer.tracks[tempTrackIndex].color : track.color
        }`,
        top: mixer.getCombinedLaneHeightsAtIndex(tempTrackIndex),
        zIndex: 9,
        position: "absolute",
        left: clipLeft,
        cursor: dragging ? "grabbing" : "auto",
      }}
    >
      {clip?.type === "audio" && <AudioClipView track={track} clip={clip} />}
    </div>
  );
});
