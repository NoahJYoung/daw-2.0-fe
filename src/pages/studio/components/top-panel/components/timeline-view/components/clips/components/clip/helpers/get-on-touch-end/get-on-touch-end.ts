import * as Tone from "tone";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { Mixer, Timeline } from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";
import { moveClipToNewTrack } from "../../../../helpers";

export const getOnTouchEnd = (
  dragging: boolean,
  setDragging: Dispatch<SetStateAction<boolean>>,
  setIsLooping: Dispatch<SetStateAction<boolean>>,
  isLooping: boolean,
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
  setLoopOffset: Dispatch<SetStateAction<number>>,
  loopOffset: number
) => {
  const resetStates = () => {
    setIsLooping(false);
    setLoopOffset(0);
    setReferenceClip(null);
    setDragging(false);
    setSelectedIndexOffset(0);
    setSelectedOffset(0);
    initialY.current = 0;
    initialX.current = 0;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!dragging || !referenceClip) {
      resetStates();
      return;
    }

    e.stopPropagation();

    if (isLooping) {
      const timeLineRelativeDifference =
        referenceClip.start + referenceClip.length;

      const timelineRelativeLoopEnd =
        timeLineRelativeDifference + referenceClip.loopSamples;

      const quantizedtimelineRelativeLoopEnd = Tone.Time(
        Tone.Time(timelineRelativeLoopEnd, "samples").quantize(
          timeline.subdivision
        ),
        "s"
      ).toSamples();

      const quantizationDifference =
        timelineRelativeLoopEnd - quantizedtimelineRelativeLoopEnd;

      mixer.selectedClips.forEach((selectedClip) => {
        const newValue = selectedClip.loopSamples + loopOffset;
        const quantizedNewValue = newValue - quantizationDifference;

        if (timeline.snapToGrid) {
          selectedClip.setLoopSamples(quantizedNewValue >= 0 ? newValue : 0);
        } else {
          selectedClip.setLoopSamples(newValue >= 0 ? newValue : 0);
        }
      });

      resetStates();
      return;
    }

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

    resetStates();
  };

  return onTouchEnd;
};
