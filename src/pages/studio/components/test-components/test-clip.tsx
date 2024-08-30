import React, { useState, useEffect, useCallback } from "react";
import { AudioClip, Track } from "../../audio-engine/components";
import { useAudioEngine, useUndoManager } from "../../hooks";
import { observer } from "mobx-react-lite";
import { Clip } from "../../audio-engine/components/types";
import { audioBufferCache } from "../../audio-engine/components/audio-buffer-cache";
import { BASE_TRACK_HEIGHT } from "../../utils/constants";

export const TestClip = observer(
  ({ clip, track }: { clip: Clip; track: Track }) => {
    const [dragging, setDragging] = useState(false);
    const audioEngine = useAudioEngine();
    const undoManager = useUndoManager();

    const onMouseDown = (e: React.MouseEvent) => {
      // TODO: REMOVE THIS AFTER TESTING
      if (e.ctrlKey) {
        const data = clip.split(
          audioEngine.timeline.pixelsToSamples(e.clientX - 220)
        );
        if (data) {
          const { snapshots, clipIdToDelete } = data;
          snapshots.forEach((snapshot) => {
            const { buffer, trackId, start, fadeInSamples, fadeOutSamples } =
              snapshot;
            const clip = new AudioClip({
              trackId,
              start,
              fadeInSamples,
              fadeOutSamples,
            });
            audioBufferCache.add(clip.id, buffer);
            clip.setBuffer(buffer);
            track.createAudioClip(clip);
            const oldClip = track.clips.find(
              (clip) => clip.id === clipIdToDelete
            );
            if (oldClip) {
              track.deleteClip(oldClip);
            }
          });
        }
        return;
      }

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
            const position = clip.start + movementXInSamples;
            clip.setStart(position >= 0 ? position : 0);
          });
        }
      },
      [audioEngine.timeline, clip, dragging, undoManager]
    );

    const onMouseUp = useCallback(
      (e: MouseEvent) => {
        if (e.ctrlKey) {
          return;
        }
        undoManager.withoutUndo(() => {
          audioEngine.mixer.tracks.forEach((track) => {
            track.clips.forEach((clip) => clip.setStart(clip.start - 1));
          });
        });
        setDragging(false);
      },
      [audioEngine.mixer.tracks, undoManager]
    );

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
    }, [onMouseMove, onMouseUp]);

    return (
      <div onMouseDown={onMouseDown} key={clip.id}>
        <div
          style={{
            height: BASE_TRACK_HEIGHT,
            background: track.rgbColor,
            position: "absolute",
            left: clipLeft,
            width: clipWidth,
          }}
        />
        {clip.loopSamples > 0 && (
          <div
            style={{
              height: BASE_TRACK_HEIGHT,
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
