import * as Tone from "tone";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { Mixer, Timeline } from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";
import { moveClipToNewTrack } from "../../../../helpers";

export const getOnMouseUp = (
  dragging: boolean,
  setDragging: Dispatch<SetStateAction<boolean>>,
  setIsLooping: Dispatch<SetStateAction<boolean>>,
  selectedOffset: number,
  setSelectedOffset: Dispatch<SetStateAction<number>>,
  selectedIndexOffset: number,
  setSelectedIndexOffset: Dispatch<SetStateAction<number>>,
  referenceClip: Clip | null,
  timeline: Timeline,
  mixer: Mixer,
  undoManager: UndoManager,
  parentTrackIndex: number,
  initialX: MutableRefObject<number>,
  initialY: MutableRefObject<number>,
  setReferenceClip: Dispatch<SetStateAction<Clip | null>>,
  setLoopOffset: Dispatch<SetStateAction<number>>
) => {
  const onMouseUp = (e: MouseEvent) => {
    setIsLooping(false);
    setReferenceClip(null);
    setLoopOffset(0);

    if (!dragging) {
      setDragging(false);
      return;
    }

    if (!referenceClip) {
      return;
    }

    e.stopPropagation();
    const initialTimeDifference = timeline.pixelsToSamples(selectedOffset);
    const firstClipStart = referenceClip.start + initialTimeDifference;

    const quantizedFirstClipStart = Tone.Time(
      Tone.Time(firstClipStart, "samples").quantize(timeline.subdivision),
      "s"
    ).toSamples();

    const quantizeOffset = timeline.snapToGrid
      ? quantizedFirstClipStart - firstClipStart
      : 0;

    mixer.selectedClips.forEach((selectedClip) => {
      const timeOffset = timeline.pixelsToSamples(selectedOffset);
      const newStart = selectedClip.start + timeOffset + quantizeOffset;

      selectedClip.setStart(newStart);
    });

    setSelectedOffset(0);
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
              selectedParentIndex + selectedIndexOffset
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
  };

  return onMouseUp;
};
