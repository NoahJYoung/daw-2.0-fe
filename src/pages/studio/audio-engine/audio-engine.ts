import { model, prop, ExtendedModel } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "./base-audio-node-wrapper";
import { AudioClip, Mixer, Timeline } from "./components";
import { audioBufferCache } from "./components/audio-buffer-cache";
import { action, observable } from "mobx";
import { AudioEngineState } from "./types";
import * as Tone from "tone";

@model("AudioEngine")
export class AudioEngine extends ExtendedModel(BaseAudioNodeWrapper, {
  timeline: prop<Timeline>(() => new Timeline({})),
  mixer: prop<Mixer>(() => new Mixer({})),
  projectId: prop<string | undefined>().withSetter(),
  projectName: prop<string>("New Project").withSetter(),
}) {
  @observable
  state: AudioEngineState = AudioEngineState.stopped;

  init() {
    const ctx = new AudioContext({ sampleRate: 44100 });
    const toneCtx = new Tone.Context(ctx);
    Tone.setContext(toneCtx);
    console.log(
      "Initializing context with sample rate: ",
      Tone.getContext().sampleRate
    );
  }

  @action
  private setState(state: AudioEngineState) {
    this.state = state;
  }

  record = async () => {
    Tone.start();
    console.log("started recording");
    const mic = new Tone.UserMedia();
    const recorder = new Tone.Recorder();

    mic.connect(recorder);

    try {
      await mic.open();
    } catch (error) {
      console.error(error);
    }

    this.setState(AudioEngineState.recording);

    if (this.mixer.tracks.length) {
      await recorder.start();

      setTimeout(async () => {
        const recording = await recorder.stop();
        this.setState(AudioEngineState.stopped);

        const url = URL.createObjectURL(recording);
        const audioBuffer = await new Tone.ToneAudioBuffer().load(url);
        // .toMono()
        // .toArray();

        const targetTrack = this.mixer.tracks[this.mixer.tracks.length - 1];
        const clip = new AudioClip({
          trackId: targetTrack.id,
          start: 0,
          // audioData,
        });

        audioBufferCache.add(clip.id, audioBuffer.toMono());
        clip.setBuffer(audioBuffer);
        targetTrack.createAudioClip(clip);

        recorder.dispose();
        mic.dispose();
        console.log("stoppedRecording");
      }, 4000);
    }
  };

  play = async () => {
    Tone.getTransport().start();
    this.setState(AudioEngineState.playing);
  };

  pause = async () => {
    Tone.getTransport().pause();
    this.setState(AudioEngineState.paused);
  };

  stop = async () => {
    const transport = Tone.getTransport();
    transport.stop();
    this.timeline.setSeconds(transport.seconds);
    this.setState(AudioEngineState.stopped);
  };
}
