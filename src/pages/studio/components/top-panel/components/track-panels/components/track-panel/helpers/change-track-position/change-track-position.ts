import { Track } from "@/pages/studio/audio-engine/components";
import { standaloneAction } from "mobx-keystone";

export const changeTrackPosition = standaloneAction(
  "myApp/arrayMove",
  (tracks: Track[], fromIndex: number, toIndex: number): void => {
    if (toIndex < tracks.length && toIndex >= 0) {
      const [movedTrack] = tracks.splice(fromIndex, 1);
      tracks.splice(toIndex, 0, movedTrack);
    }
  }
);
