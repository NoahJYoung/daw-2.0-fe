import { model, ExtendedModel, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import * as Tone from "tone";

const MAX_SAMPLES_PER_PIXEL = 4096;
const MIN_SAMPLES_PER_PIXEL = 32;

@model("AudioEngine/Transport")
export class Timeline extends ExtendedModel(BaseAudioNodeWrapper, {
  bpm: prop(Tone.getTransport().bpm.value).withSetter(),
  timeSignature: prop(Tone.getTransport().timeSignature as number).withSetter(),
  measures: prop(200).withSetter(),
  samplesPerPixel: prop(4096).withSetter(),
  ticks: prop(0).withSetter(),
}) {
  sync() {
    const transport = Tone.getTransport();
    transport.bpm.value = Math.round(this.bpm);
    transport.timeSignature = this.timeSignature;
    transport.ticks = this.ticks;
  }

  zoomOut() {
    if (this.samplesPerPixel < MAX_SAMPLES_PER_PIXEL) {
      this.setSamplesPerPixel(this.samplesPerPixel * 2);
    }
  }
  zoomIn() {
    if (this.samplesPerPixel >= MIN_SAMPLES_PER_PIXEL) {
      this.setSamplesPerPixel(this.samplesPerPixel / 2);
    }
  }

  setTicksFromPixels(pixels: number) {
    const samples = this.pixelsToSamples(pixels);
    const ticks = Tone.Time(samples, "samples").toTicks();
    this.setTicks(ticks);
  }

  samplesToPixels(samples: number) {
    return samples / this.samplesPerPixel;
  }

  pixelsToSamples(pixels: number) {
    return pixels * this.samplesPerPixel;
  }
}
