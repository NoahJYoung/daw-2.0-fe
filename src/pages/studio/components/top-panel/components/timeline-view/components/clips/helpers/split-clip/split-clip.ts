import {
  AudioClip,
  MidiClip,
  Mixer,
  audioBufferCache,
} from "@/pages/studio/audio-engine/components";
import { MidiNote } from "@/pages/studio/audio-engine/components/midi-note";
import { Clip } from "@/pages/studio/audio-engine/components/types";
import { clone } from "mobx-keystone";
import * as Tone from "tone";

export const splitClip = (clip: Clip, mixer: Mixer) => {
  if (clip instanceof AudioClip) {
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
  } else if (clip instanceof MidiClip) {
    const data = clip.split(
      Tone.Time(Tone.getTransport().seconds, "s").toSamples()
    );
    if (data) {
      const { snapshots, clipIdToDelete } = data;
      snapshots.forEach((snapshot) => {
        const stringifiedEvents = JSON.stringify(snapshot.events);
        // console.log(stringifiedEvents);

        const clip = new MidiClip({
          trackId: snapshot.trackId,
          start: snapshot.start,
          end: snapshot.end,
          fadeInSamples: snapshot.fadeInSamples,
          fadeOutSamples: snapshot.fadeOutSamples,
          events: JSON.parse(stringifiedEvents).map((event: never) => {
            const { note, on, off, velocity } = event["$"];
            const midiNote = new MidiNote({ note, on, off, velocity });
            return midiNote;
          }),
        });

        const parentTrack = mixer.tracks.find(
          (track) => track.id === clip.trackId
        );
        if (parentTrack) {
          parentTrack.createMidiClip(clone(clip));
          const oldClip = parentTrack.clips.find(
            (clip) => clip.id === clipIdToDelete
          );
          if (oldClip) {
            parentTrack.deleteClip(oldClip);
          }
        }
      });
    }
  }
};
