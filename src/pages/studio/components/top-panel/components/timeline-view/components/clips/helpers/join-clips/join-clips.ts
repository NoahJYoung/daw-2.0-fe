import {
  AudioClip,
  MidiClip,
  Mixer,
  audioBufferCache,
} from "@/pages/studio/audio-engine/components";
import { EventData } from "@/pages/studio/audio-engine/components/keyboard/types";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { PitchNameTuple } from "@/pages/studio/audio-engine/components/midi-note/types";
import { UndoManager } from "mobx-keystone";
import * as Tone from "tone";

export const joinClips = (mixer: Mixer, undoManager: UndoManager) => {
  undoManager.withGroup("JOIN SELECTED CLIPS", () => {
    const clips = mixer.selectedClips;
    if (
      !mixer.selectedClips.every((clip) => clip.trackId === clips[0].trackId)
    ) {
      throw new Error("Can only join clips on the same track");
    }

    if (clips.length === 0) return;
    const trackId = clips[0].trackId;

    if (clips.every((clip) => clip instanceof AudioClip)) {
      clips.sort((a, b) => a.start - b.start);

      if (!clips.every((clip) => clip.trackId === trackId)) {
        throw new Error(
          "All clips must belong to the same track to join them."
        );
      }

      const totalLength = clips.reduce((length, clip, index) => {
        const clipEnd = clip.start + clip.length;
        if (index < clips.length - 1) {
          const nextClipStart = clips[index + 1].start;
          const gap = nextClipStart - clipEnd;
          return length + (gap > 0 ? gap : 0) + clip.length;
        }
        return length + clip.length;
      }, 0);

      const ctx = Tone.getContext();
      const mergedBuffer = ctx.createBuffer(1, totalLength, ctx.sampleRate);

      let position = 0;
      clips.forEach((clip, index) => {
        if (clip.buffer) {
          mergedBuffer.copyToChannel(
            clip.buffer.getChannelData(0),
            0,
            position
          );

          position += clip.buffer.length;

          if (index < clips.length - 1) {
            const nextClipStart = clips[index + 1].start;
            const gap = nextClipStart - (clip.start + clip.buffer.length);
            if (gap > 0) {
              position += gap;
            }
          }
        }
      });

      const mergedClip = new AudioClip({
        trackId,
        start: clips[0].start,
        fadeInSamples: clips[0].fadeInSamples,
        fadeOutSamples: clips[clips.length - 1].fadeOutSamples,
      });

      const toneBuffer = new Tone.ToneAudioBuffer(mergedBuffer);

      mergedClip.createWaveformCache(toneBuffer);
      audioBufferCache.add(mergedClip.id, toneBuffer);
      mergedClip.setBuffer(toneBuffer);

      const parentTrack = mixer.tracks.find((track) => track.id === trackId);
      if (parentTrack) {
        clips.forEach((clip) => {
          const oldClip = parentTrack.clips.find((c) => c.id === clip.id);
          if (oldClip) {
            parentTrack.deleteClip(oldClip);
          }
        });

        parentTrack.createAudioClip(mergedClip);
      }
    } else if (clips.every((clip) => clip instanceof MidiClip)) {
      const sortedClips = [...clips].sort((a, b) => a.start - b.start);
      const events: EventData[] = [];

      clips.forEach((clip) => {
        clip.events.forEach((event) => {
          const adjustedEvent = {
            on: event.on + clip.start - sortedClips[0].start,
            off: event.off + clip.start - sortedClips[0].start,
            note: [...event.note] as PitchNameTuple,
            velocity: event.velocity,
          };
          events.push(adjustedEvent);
        });
      });

      const newClipData = {
        trackId,
        start: sortedClips?.[0].start,
        end: sortedClips?.[sortedClips.length - 1].end,
        events: [...events].map(
          (event) =>
            new MidiNote({
              note: event.note,
              on: event.on,
              off: event.off,
              velocity: event.velocity,
            })
        ),
      };

      const parentTrack = mixer.tracks.find((track) => track.id === trackId);
      if (parentTrack) {
        clips.forEach((clip) => {
          parentTrack.deleteClip(clip);
        });

        const newMidiClip = new MidiClip(newClipData);

        parentTrack.createMidiClip(newMidiClip);
      }
    }
  });
};
