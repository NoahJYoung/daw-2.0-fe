import { Mixer, Timeline } from "@/pages/studio/audio-engine/components";
import { splitClip } from "../split-clip";
import { UndoManager } from "mobx-keystone";

export const splitSelectedClips = (
  mixer: Mixer,
  timeline: Timeline,
  undoManager: UndoManager
) => {
  const { selectedClips } = mixer;
  undoManager.withGroup(() => {
    selectedClips.forEach((clip) => {
      if (
        timeline.positionInSamples > clip.start &&
        timeline.positionInSamples < clip.end
      ) {
        splitClip(clip, mixer, timeline);
      }
    });
  });
};
