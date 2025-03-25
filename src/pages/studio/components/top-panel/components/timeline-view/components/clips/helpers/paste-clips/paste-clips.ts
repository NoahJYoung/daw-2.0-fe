import {
  audioBufferCache,
  AudioClip,
  Clipboard,
  MidiClip,
  Mixer,
  waveformCache,
} from "@/pages/studio/audio-engine/components";
import { clone, UndoManager } from "mobx-keystone";
import * as Tone from "tone";

export const pasteClips = (
  clipboard: Clipboard,
  mixer: Mixer,
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
        const relativeOffset = clip.start - firstClipStart;
        const newStartPosition = timelinePosition + relativeOffset;
        if (clip instanceof AudioClip) {
          const newClip = new AudioClip({
            start: newStartPosition,
            trackId: track.id,
            fadeInSamples: clip.fadeInSamples,
            fadeOutSamples: clip.fadeOutSamples,
            loopSamples: clip.loopSamples,
            midiNotes: [...clip.midiNotes].map((note) => clone(note)),
          });

          if (clip.buffer) {
            newClip.setBuffer(clip.buffer);
          }

          audioBufferCache.copy(clip.id, newClip.id);
          waveformCache.copy(clip.id, newClip.id);

          track.createAudioClip(newClip);
        } else if (clip instanceof MidiClip) {
          const {
            locked,
            start,
            end,
            loopSamples,
            fadeInSamples,
            fadeOutSamples,
          } = clip;

          const startDifference = start - newStartPosition;

          const newClip = new MidiClip({
            locked,
            start: newStartPosition,
            end: end - startDifference,
            loopSamples,
            fadeInSamples,
            fadeOutSamples,
            events: [...clip.events.map((event) => clone(event))],
            trackId: track.id,
          });
          track.createMidiClip(newClip);
        }
      });
    });
  });
};
