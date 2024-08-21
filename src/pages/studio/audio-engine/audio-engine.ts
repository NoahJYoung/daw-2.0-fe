import { model, prop, ExtendedModel } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "./base-audio-node-wrapper";
import { AudioClip, Mixer, Transport } from "./components";
import * as Tone from "tone";
import { getSerializableAudioData } from "./helpers";

@model("AudioEngine")
export class AudioEngine extends ExtendedModel(BaseAudioNodeWrapper, {
  transport: prop<Transport>(() => new Transport({})),
  mixer: prop<Mixer>(() => new Mixer({})),
  projectId: prop<string | undefined>().withSetter(),
  projectName: prop<string>("New Project").withSetter(),
}) {
  mockRecord = async () => {
    Tone.start();
    console.log("started tone");
    const mic = new Tone.UserMedia();
    const recorder = new Tone.Recorder();

    mic.connect(recorder);

    try {
      await mic.open();
    } catch (error) {
      console.error(error);
    }

    if (this.mixer.tracks.length) {
      await recorder.start();

      console.log("recording");
      setTimeout(async () => {
        const recording = await recorder.stop();
        const url = URL.createObjectURL(recording);
        const audioData = (await new Tone.ToneAudioBuffer().load(url))
          .toMono()
          .toArray();

        const targetTrack = this.mixer.tracks[0];
        const clip = new AudioClip({
          trackId: targetTrack.id,
          start: 0,
          audioData: getSerializableAudioData(audioData),
        });
        targetTrack.createAudioClip(clip);

        recorder.dispose();
        mic.dispose();
      }, 4000);
    }
  };
}
