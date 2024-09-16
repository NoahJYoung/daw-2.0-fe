import {
  AudioClip,
  Mixer,
  audioBufferCache,
} from "@/pages/studio/audio-engine/components";
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

    if (clips.every((clip) => clip instanceof AudioClip)) {
      // Sort clips by their start time to ensure we are joining them in order
      clips.sort((a, b) => a.start - b.start);

      // Ensure all clips are on the same track
      const trackId = clips[0].trackId;
      if (!clips.every((clip) => clip.trackId === trackId)) {
        throw new Error(
          "All clips must belong to the same track to join them."
        );
      }

      // Calculate the total length of the new merged clip, accounting for gaps
      const totalLength = clips.reduce((length, clip, index) => {
        const clipEnd = clip.start + clip.length;
        // If this isn't the last clip, calculate the gap to the next clip
        if (index < clips.length - 1) {
          const nextClipStart = clips[index + 1].start;
          const gap = nextClipStart - clipEnd;
          return length + (gap > 0 ? gap : 0) + clip.length;
        }
        return length + clip.length;
      }, 0);

      // Create a new audio buffer to hold all the merged audio
      // const mergedBuffer = new Tone.ToneAudioBuffer();
      const ctx = Tone.getContext();
      const mergedBuffer = ctx.createBuffer(1, totalLength, ctx.sampleRate);

      // Fill the merged buffer with the clips and account for gaps
      let position = 0;
      clips.forEach((clip, index) => {
        if (clip.buffer) {
          // Copy the clip's buffer into the merged buffer at the correct position
          mergedBuffer.copyToChannel(
            clip.buffer.getChannelData(0),
            0,
            position
          );

          // Move the position forward by the length of the clip
          position += clip.buffer.length;

          // Calculate the gap between this clip and the next, if any
          if (index < clips.length - 1) {
            const nextClipStart = clips[index + 1].start;
            const gap = nextClipStart - (clip.start + clip.buffer.length);
            if (gap > 0) {
              // Add silence for the gap
              position += gap;
            }
          }
        }
      });

      // Create the new merged clip
      const mergedClip = new AudioClip({
        trackId,
        start: clips[0].start,
        fadeInSamples: clips[0].fadeInSamples, // Optionally handle fades better
        fadeOutSamples: clips[clips.length - 1].fadeOutSamples,
      });

      const toneBuffer = new Tone.ToneAudioBuffer(mergedBuffer);

      // Set the merged buffer to the new clip
      mergedClip.createWaveformCache(toneBuffer);
      audioBufferCache.add(mergedClip.id, toneBuffer);
      mergedClip.setBuffer(toneBuffer);

      // Get the parent track
      const parentTrack = mixer.tracks.find((track) => track.id === trackId);
      if (parentTrack) {
        // Remove the original clips
        clips.forEach((clip) => {
          const oldClip = parentTrack.clips.find((c) => c.id === clip.id);
          if (oldClip) {
            parentTrack.deleteClip(oldClip);
          }
        });

        // Add the new merged clip to the track
        parentTrack.createAudioClip(mergedClip);
      }
    }
  });
};
