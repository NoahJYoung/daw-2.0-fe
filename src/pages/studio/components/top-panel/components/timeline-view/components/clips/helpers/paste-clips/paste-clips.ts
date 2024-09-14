import {
  audioBufferCache,
  AudioClip,
  Clipboard,
  Mixer,
  Timeline,
  waveformCache,
} from "@/pages/studio/audio-engine/components";
import * as Tone from "tone";

export const pasteClips = (
  clipboard: Clipboard,
  mixer: Mixer,
  timeline: Timeline
) => {
  const timelinePosition = Tone.Time(
    Tone.getTransport().seconds,
    "s"
  ).toSamples();
  mixer.selectedTracks.forEach((track) => {
    clipboard.getClips().forEach((clip) => {
      if (clip.type === "audio") {
        const newClip = new AudioClip({
          start: clip.start + timelinePosition,
          trackId: track.id,
          fadeInSamples: clip.fadeInSamples,
          fadeOutSamples: clip.fadeOutSamples,
          loopSamples: clip.loopSamples,
        });

        newClip.setInitialBufferLength(clip.length);
        const initialWaveformData = waveformCache.get(
          clip.id,
          timeline.samplesPerPixel
        );
        if (initialWaveformData) {
          newClip.setInitialWaveformData(initialWaveformData);
        }

        audioBufferCache.copy(clip.id, newClip.id);
        waveformCache.copy(clip.id, newClip.id);

        track.createAudioClip(newClip);
      }
    });
  });
};
