import { Mixer, Timeline } from "@/pages/studio/audio-engine/components";
import { splitClip } from "../split-clip";
import { UndoManager } from "mobx-keystone";

export const splitSelectedClips = (
  e: React.MouseEvent,
  mixer: Mixer,
  timeline: Timeline,
  undoManager: UndoManager
) => {
  const { selectedClips } = mixer;
  e.stopPropagation();
  selectedClips.forEach((clip) => {
    if (
      timeline.positionInSamples > clip.start &&
      timeline.positionInSamples < clip.end
    ) {
      undoManager.withGroup(() => {
        splitClip(clip, mixer);
      });
    }
  });
};
