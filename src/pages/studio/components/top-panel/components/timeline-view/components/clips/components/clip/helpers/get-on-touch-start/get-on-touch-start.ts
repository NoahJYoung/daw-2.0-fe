import { Track, Mixer } from "@/pages/studio/audio-engine/components";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { UndoManager } from "mobx-keystone";
import { Dispatch, SetStateAction } from "react";

export const getOnTouchStart = (
  initialX: React.MutableRefObject<number>,
  initialY: React.MutableRefObject<number>,
  setDragging: React.Dispatch<SetStateAction<boolean>>,
  clip: Clip,
  track: Track,
  mixer: Mixer,
  undoManager: UndoManager,
  setReferenceClip: Dispatch<SetStateAction<Clip | null>>
) => {
  const onTouchStart = (e: React.TouchEvent) => {
    setReferenceClip(clip);
    e.stopPropagation();

    setDragging(true);

    initialY.current = e.touches[0].clientY;
    initialX.current = e.touches[0].clientX;

    undoManager.withGroup("UNSELECT ALL AND SELECT ONE", () => {
      if (!e.ctrlKey) {
        mixer.unselectAllClips();
      }

      if (!clip.locked) {
        track.selectClip(clip);
      }
    });
  };

  return onTouchStart;
};
