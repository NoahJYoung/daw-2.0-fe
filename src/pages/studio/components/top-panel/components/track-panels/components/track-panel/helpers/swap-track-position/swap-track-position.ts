import { Track } from "@/pages/studio/audio-engine/components";
import { standaloneAction } from "mobx-keystone";

export const swapTrackPosition = standaloneAction(
  "myApp/arraySwap",
  (tracks: Track[], index1: number, index2: number): void => {
    if (index2 < tracks.length && index2 >= 0) {
      if (index2 < index1) {
        [index1, index2] = [index2, index1];
      }
      const [v1] = tracks.splice(index1, 1);
      const [v2] = tracks.splice(index2 - 1, 1);
      tracks.splice(index1, 0, v2);
      tracks.splice(index2, 0, v1);
    }
  }
);
