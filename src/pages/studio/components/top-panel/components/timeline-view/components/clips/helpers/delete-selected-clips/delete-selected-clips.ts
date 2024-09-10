import { Mixer } from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";

export const deleteSelectedClips = (mixer: Mixer, undoManager: UndoManager) => {
  const { selectedClips } = mixer;

  undoManager.withGroup(() => {
    selectedClips.forEach((clip) => {
      const parentTrack = mixer.tracks.find(
        (track) => track.id === clip.trackId
      );
      if (parentTrack) {
        parentTrack.deleteClip(clip);
      }
    });
  });
};
