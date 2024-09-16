import {
  AudioClip,
  Mixer,
  audioBufferCache,
} from "@/pages/studio/audio-engine/components";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import * as Tone from "tone";

export const splitClip = (clip: Clip, mixer: Mixer) => {
  if (clip.type === "audio") {
    const data = clip.split(
      Tone.Time(Tone.getTransport().seconds, "s").toSamples()
    );
    if (data) {
      const { snapshots, clipIdToDelete } = data;
      snapshots.forEach((snapshot) => {
        const { buffer, trackId, start, fadeInSamples, fadeOutSamples } =
          snapshot;
        const clip = new AudioClip({
          trackId,
          start,
          fadeInSamples,
          fadeOutSamples,
        });

        clip.createWaveformCache(buffer);
        audioBufferCache.add(clip.id, buffer);
        clip.setBuffer(buffer);
        const parentTrack = mixer.tracks.find(
          (track) => track.id === clip.trackId
        );
        if (parentTrack) {
          parentTrack.createAudioClip(clip);
          const oldClip = parentTrack.clips.find(
            (clip) => clip.id === clipIdToDelete
          );
          if (oldClip) {
            parentTrack.deleteClip(oldClip);
          }
        }
      });
    }
    return;
  }
};
