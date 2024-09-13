import {
  audioBufferCache,
  AudioClip,
  Mixer,
} from "@/pages/studio/audio-engine/components";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { waveformCache } from "@/pages/studio/audio-engine/components/waveform-cache";
import { UndoManager } from "mobx-keystone";

export const moveClipToNewTrack = (
  oldClip: Clip,
  mixer: Mixer,
  undoManager: UndoManager,
  oldTrackIndex: number,
  newTrackIndex: number,
  samplesPerPixel: number
) => {
  if (
    oldTrackIndex !== newTrackIndex &&
    newTrackIndex >= 0 &&
    newTrackIndex < mixer.tracks.length
  ) {
    undoManager.withGroup(async () => {
      if (oldClip.type === "audio") {
        const newTrackId = mixer.tracks[newTrackIndex].id;
        const newClip = new AudioClip({
          start: oldClip.start,
          type: "audio",
          fadeInSamples: oldClip.fadeInSamples,
          fadeOutSamples: oldClip.fadeOutSamples,
          trackId: newTrackId,
          loopSamples: oldClip.loopSamples,
          // initialBufferLength: oldClip.length,
        });
        newClip.setInitialBufferLength(oldClip.length);
        const initialWaveformData = waveformCache.get(
          oldClip.id,
          samplesPerPixel
        );
        if (initialWaveformData) {
          newClip.setInitialWaveformData(initialWaveformData);
        }

        audioBufferCache.copy(oldClip.id, newClip.id);
        waveformCache.copy(oldClip.id, newClip.id);
        mixer.tracks[oldTrackIndex].deleteClip(oldClip);
        mixer.tracks[newTrackIndex].createAudioClip(newClip);
      }
    });
  }
};
