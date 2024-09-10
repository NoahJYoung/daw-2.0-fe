import {
  AudioClip,
  MidiClip,
  Track,
} from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { AudioClipView } from "./components";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { useState, useCallback, useEffect } from "react";

interface ClipProps {
  track: Track;
  clip: AudioClip | MidiClip;
}

export const Clip = observer(({ clip, track }: ClipProps) => {
  const [dragging, setDragging] = useState(false);
  const { timeline, mixer } = useAudioEngine();
  const undoManager = useUndoManager();
  const selected = mixer.selectedClips.includes(clip);

  const onMouseDown = () => {
    setDragging(true);
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
      if (dragging) {
        const movementXInSamples = timeline.pixelsToSamples(e.movementX);

        if (selected) {
          undoManager.withoutUndo(() => {
            mixer.selectedClips.forEach((selectedClip) => {
              const position = selectedClip.start + movementXInSamples;
              selectedClip.setStart(position >= 0 ? position : 0);
            });
          });
        } else {
          const position = clip.start + movementXInSamples;
          undoManager.withoutUndo(() => {
            clip.setStart(position >= 0 ? position : 0);
          });
        }
      }
    },
    [dragging, timeline, clip, selected, mixer.selectedClips, undoManager]
  );

  const onMouseUp = useCallback(() => {
    undoManager.withoutUndo(() => {
      mixer.tracks.forEach((track) => {
        track.clips.forEach((clip) => clip.setStart(clip.start - 1));
      });
    });
    setDragging(false);
  }, [mixer.tracks, undoManager]);

  const clipLeft = timeline.samplesToPixels(clip.start);

  // const loopLeft = clipLeft + timeline.samplesToPixels(clip.length);

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
        height: track.laneHeight - 2,
        background: track.color,
        border: `1px solid ${track.color}`,
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
