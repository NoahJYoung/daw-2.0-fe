import { Mixer } from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";

export const selectAllTracks = (mixer: Mixer, undoManager: UndoManager) => {
  undoManager.withGroup("SELECT ALL TRACKS", () => {
    mixer.tracks.forEach((track) => mixer.selectTrack(track));
  });
};
