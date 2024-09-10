import { Mixer } from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";

export const selectAllClips = (mixer: Mixer, undoManager: UndoManager) => {
  undoManager.withGroup(() => {
    mixer.tracks.forEach((track) => track.selectAllClips());
  });
};
