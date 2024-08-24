import { useState, useEffect, useCallback } from "react";
import { Track } from "../../audio-engine/components";
import { useAudioEngine, useUndoManager } from "../../hooks";
import { observer } from "mobx-react-lite";
import { Clip } from "../../audio-engine/components/types";

export const TestClip = observer(
  ({ clip, track }: { clip: Clip; track: Track }) => {
    const [dragging, setDragging] = useState(false);
    const audioEngine = useAudioEngine();
    const undoManager = useUndoManager();

    const onMouseDown = () => {
      setDragging(true);
      undoManager.withGroup(() => {
        audioEngine.mixer.tracks.forEach((track) => {
          track.clips.forEach((clip) => clip.setStart(clip.start + 1));
        });
      });
    };

    const onMouseMove = useCallback(
      (e: MouseEvent) => {
        if (dragging) {
          const movementXInSamples = audioEngine.timeline.pixelsToSamples(
            e.movementX
          );

          undoManager.withoutUndo(() => {
            audioEngine.mixer.tracks.forEach((track) => {
              track.clips.forEach((clip) =>
                clip.setStart(clip.start + movementXInSamples)
              );
            });
          });
        }
      },
      [audioEngine.mixer.tracks, audioEngine.timeline, dragging, undoManager]
    );

    const onMouseUp = () => {
      undoManager.withoutUndo(() => {
        audioEngine.mixer.tracks.forEach((track) => {
          track.clips.forEach((clip) => clip.setStart(clip.start - 1));
        });
      });
      setDragging(false);
    };

    const clipWidth = audioEngine.timeline.samplesToPixels(clip.length);
    const clipLeft = audioEngine.timeline.samplesToPixels(clip.start);

    const loopLeft =
      clipLeft + audioEngine.timeline.samplesToPixels(clip.length);

    useEffect(() => {
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
      return () => {
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousemove", onMouseMove);
      };
    }, [onMouseMove]);

    return (
      <div onMouseDown={onMouseDown} key={clip.id}>
        <div
          style={{
            height: 80,
            background: track.rgbColor,
            position: "absolute",
            left: clipLeft,
            width: clipWidth,
          }}
        />
        {clip.loopSamples && (
          <div
            style={{
              height: 80,
              border: `1px solid ${track.rgbColor}`,
              position: "absolute",
              left: loopLeft,
              width: audioEngine.timeline.samplesToPixels(clip.loopSamples),
            }}
          />
        )}
      </div>
    );
  }
);
