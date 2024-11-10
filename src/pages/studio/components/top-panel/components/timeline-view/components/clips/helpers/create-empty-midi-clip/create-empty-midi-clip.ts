import { MidiClip, Mixer } from "@/pages/studio/audio-engine/components";
import { clone } from "mobx-keystone";
import * as Tone from "tone";

export const createEmptyMidiClip = (mixer: Mixer) => {
  const positionInSamples = Tone.Time(
    Tone.getTransport().seconds,
    "s"
  ).toSamples();
  const fourMeasureWidth = Tone.Time("1m").toSamples() * 4;

  mixer.selectedTracks.forEach((track) => {
    const clip = new MidiClip({
      trackId: track.id,
      start: positionInSamples,
      end: positionInSamples + fourMeasureWidth,
    });
    track.createMidiClip(clone(clip));
  });
};
