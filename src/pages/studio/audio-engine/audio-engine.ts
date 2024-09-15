import { model, prop, ExtendedModel } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "./base-audio-node-wrapper";
import {
  AudioClip,
  Mixer,
  Timeline,
  waveformCache,
  Clipboard,
} from "./components";
import { audioBufferCache } from "./components/audio-buffer-cache";
import { action, observable } from "mobx";
import { AudioEngineState } from "./types";
import * as Tone from "tone";
import { getPeaks } from "./components/audio-buffer-cache/helpers";

@model("AudioEngine")
export class AudioEngine extends ExtendedModel(BaseAudioNodeWrapper, {
  timeline: prop<Timeline>(() => new Timeline({})),
  mixer: prop<Mixer>(() => new Mixer({})),
  projectId: prop<string | undefined>().withSetter(),
  projectName: prop<string>("New Project").withSetter(),
}) {
  @observable
  state: AudioEngineState = AudioEngineState.stopped;
  clipboard = new Clipboard();

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
    const start = Tone.Time(Tone.getTransport().seconds, "s").toSamples();
    this.setState(AudioEngineState.recording);
    const activeTracks = this.mixer.getActiveTracks();

    const transport = Tone.getTransport();

    const mic = new Tone.UserMedia();
    const recorder = new Tone.Recorder();

    mic.connect(recorder);

    try {
      await mic.open();
    } catch (error) {
      console.error(error);
    }

    await this.play();
    await recorder.start();
    transport.once("stop", async () => {
      const recording = await recorder.stop();
      const url = URL.createObjectURL(recording);
      const audioBuffer = await new Tone.ToneAudioBuffer().load(url);
      activeTracks.forEach((track) => {
        const clip = new AudioClip({
          trackId: track.id,
          start,
        });

        const initialWaveformData = getPeaks(
          audioBuffer.getChannelData(0),
          this.timeline.samplesPerPixel
        );

        waveformCache.add(
          clip.id,
          initialWaveformData,
          this.timeline.samplesPerPixel
        );
        audioBufferCache.add(clip.id, audioBuffer.toMono());
        clip.setBuffer(audioBuffer);
        clip.setInitialWaveformData(initialWaveformData);
        track.createAudioClip(clip);
      });

      recorder.dispose();
      mic.dispose();
    });
  };

  play = async () => {
    Tone.start();
    this.mixer.tracks.forEach((track) => track.play());
    Tone.getTransport().start();
    if (this.state !== AudioEngineState.recording) {
      this.setState(AudioEngineState.playing);
    }
  };

  pause = async () => {
    const transport = Tone.getTransport();
    const seconds = transport.seconds;
    this.mixer.tracks.forEach((track) => track.stop());

    transport.pause();
    if (this.state === AudioEngineState.recording) {
      this.stop();
      transport.seconds = seconds;
      this.timeline.setSeconds(transport.seconds);
    }
    this.setState(AudioEngineState.paused);
  };

  stop = async () => {
    const transport = Tone.getTransport();
    transport.stop();
    this.timeline.setSeconds(transport.seconds);
    this.setState(AudioEngineState.stopped);
  };
}
