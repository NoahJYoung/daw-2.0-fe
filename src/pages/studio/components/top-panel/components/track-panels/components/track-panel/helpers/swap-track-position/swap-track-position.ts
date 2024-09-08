import { Track } from "@/pages/studio/audio-engine/components";
import { standaloneAction } from "mobx-keystone";

export const swapTrackPosition = standaloneAction(
  "myApp/arraySwap",
  (array: Track[], index1: number, index2: number): void => {
    if (index2 < index1) {
      [index1, index2] = [index2, index1];
    }
    const [v1] = array.splice(index1, 1);
    const [v2] = array.splice(index2 - 1, 1);
    array.splice(index1, 0, v2);
    array.splice(index2, 0, v1);
  }
);
