import { Mixer } from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";

export const deleteSelectedTracks = (
  mixer: Mixer,
  undoManager: UndoManager
) => {
  undoManager.withGroup("DELETE SELECTED TRACKS", () => {
    mixer.selectedTracks.forEach((track) => mixer.removeTrack(track));
  });
};
