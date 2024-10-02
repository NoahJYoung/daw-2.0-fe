import { Track, Mixer } from "@/pages/studio/audio-engine/components";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { UndoManager } from "mobx-keystone";
import { Dispatch, SetStateAction } from "react";

export const getOnMouseDown = (
  initialX: React.MutableRefObject<number>,
  initialY: React.MutableRefObject<number>,
  setDragging: React.Dispatch<SetStateAction<boolean>>,
  clip: Clip,
  track: Track,
  mixer: Mixer,
  undoManager: UndoManager,
  setReferenceClip: Dispatch<SetStateAction<Clip | null>>
) => {
  const onMouseDown = (e: React.MouseEvent) => {
    setReferenceClip(clip);
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

        if (!clip.locked) {
          track.selectClip(clip);
        }
      });
    }
  };
  return onMouseDown;
};
