import { Track } from "@/pages/studio/audio-engine/components";
import { standaloneAction } from "mobx-keystone";

export const changeTrackPosition = standaloneAction(
  "myApp/arrayMove",
  (array: Track[], fromIndex: number, toIndex: number): void => {
    const [movedTrack] = array.splice(fromIndex, 1);
    array.splice(toIndex, 0, movedTrack);
  }
);
