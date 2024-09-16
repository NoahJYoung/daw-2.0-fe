import {
  audioBufferCache,
  AudioClip,
  Clipboard,
  Mixer,
  Timeline,
  waveformCache,
} from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";
import * as Tone from "tone";

export const pasteClips = (
  clipboard: Clipboard,
  mixer: Mixer,
  timeline: Timeline,
  undoManager: UndoManager
) => {
  const timelinePosition = Tone.Time(
    Tone.getTransport().seconds,
    "s"
  ).toSamples();
  undoManager.withGroup("PASTE CLIPS", () => {
    mixer.selectedTracks.forEach((track) => {
      const clips = clipboard.getClips();
      const firstClipStart = clips.length > 0 ? clips[0].start : 0;

      clips.forEach((clip) => {
        if (clip.type === "audio") {
          const relativeOffset = clip.start - firstClipStart;
          const newStartPosition = timelinePosition + relativeOffset;
          const newClip = new AudioClip({
            start: newStartPosition,
            trackId: track.id,
            fadeInSamples: clip.fadeInSamples,
            fadeOutSamples: clip.fadeOutSamples,
            loopSamples: clip.loopSamples,
          });

          if (clip.buffer) {
            newClip.setBuffer(clip.buffer);
          }

          audioBufferCache.copy(clip.id, newClip.id);
          waveformCache.copy(clip.id, newClip.id);

          track.createAudioClip(newClip);
        }
      });
    });
  });
};
