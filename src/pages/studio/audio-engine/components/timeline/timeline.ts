import {
  model,
  ExtendedModel,
  prop,
  modelAction,
  getRoot,
} from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { MAX_SAMPLES_PER_PIXEL, MIN_SAMPLES_PER_PIXEL } from "../../constants";
import * as Tone from "tone";
import { computed } from "mobx";
import { AudioEngineState } from "../../types";

@model("AudioEngine/Transport")
export class Timeline extends ExtendedModel(BaseAudioNodeWrapper, {
  bpm: prop(Tone.getTransport().bpm.value).withSetter(),
  timeSignature: prop(Tone.getTransport().timeSignature as number).withSetter(),
  measures: prop(301).withSetter(),
  samplesPerPixel: prop(4096).withSetter(),
  seconds: prop(0),
  subdivision: prop("4n").withSetter(),
  snapToGrid: prop(false).withSetter(),
}) {
  init() {
    this.sync();
  }
  sync() {
    const transport = Tone.getTransport();
    transport.bpm.value = Math.round(this.bpm);
    transport.timeSignature = this.timeSignature;
    this.seconds = transport.seconds;
  }

  zoomOut() {
    if (this.canZoomOut) {
      this.setSamplesPerPixel(this.samplesPerPixel * 2);
    }
  }
  zoomIn() {
    if (this.canZoomIn) {
      this.setSamplesPerPixel(this.samplesPerPixel / 2);
    }
  }

  setSecondsFromPixels(pixels: number) {
    const samples = this.pixelsToSamples(pixels);
    const seconds = Tone.Time(samples, "samples").toSeconds();
    this.setSeconds(seconds);
  }

  samplesToPixels(samples: number) {
    return samples / this.samplesPerPixel;
  }

  pixelsToSamples(pixels: number) {
    return pixels * this.samplesPerPixel;
  }

  @modelAction
  setSeconds(seconds: number) {
    const audioEngine = getRoot(this);
    if (audioEngine.state === AudioEngineState.recording) {
      return;
    }

    if (audioEngine.state === AudioEngineState.playing) {
      audioEngine.pause();
      Tone.getTransport().seconds = seconds;
      this.seconds = seconds;
      audioEngine.play();
    } else {
      this.seconds = seconds;
      Tone.getTransport().seconds = seconds;
    }
  }

  @computed
  get samples(): number {
    const quarterNoteSamples = Tone.Time("4n").toSamples();
    const numQuarterNotes = this.measures * this.timeSignature;
    return quarterNoteSamples * numQuarterNotes;
  }

  @computed
  get pixels(): number {
    return this.samplesToPixels(this.samples);
  }

  @computed
  get positionInSamples() {
    return Tone.Time(this.seconds, "s").toSamples();
  }

  @computed
  get positionInPixels() {
    return this.samplesToPixels(this.positionInSamples);
  }

  @computed
  get canZoomIn(): boolean {
    return this.samplesPerPixel > MIN_SAMPLES_PER_PIXEL;
  }

  @computed
  get canZoomOut(): boolean {
    return this.samplesPerPixel < MAX_SAMPLES_PER_PIXEL;
  }
}
