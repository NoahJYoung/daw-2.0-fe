import { ExtendedModel, model, prop } from "mobx-keystone";
import { Effect } from "../../effect/effect";
import * as Tone from "tone";

@model("AudioEngine/Effects/Compressor")
export class Compressor extends ExtendedModel(Effect, {
  attack: prop<number>(0.1).withSetter(),
  release: prop<number>(0.2).withSetter(),
  threshold: prop<number>(0).withSetter(),
  ratio: prop<number>(4).withSetter(),
  knee: prop<number>(0).withSetter(),
  makeupGain: prop<number>(1).withSetter(),
}) {
  private compressor = new Tone.Compressor();
  private gain = new Tone.Gain(this.makeupGain);
  private hasConnected = false;
  inputMeter = new Tone.Meter(0.99);

  get name() {
    return "Compressor";
  }

  get reduction() {
    return this.compressor.reduction;
  }

  sync() {
    super.sync();
    if (this.hasConnected) {
      this.disconnect();
    }
    const { attack, release, threshold, ratio, knee, makeupGain } = this;
    this.compressor.set({
      attack,
      release,
      threshold,
      ratio,
      knee,
    });
    this.gain.gain.linearRampTo(makeupGain, 0.2);

    this.connect();
  }

  init() {
    super.init();
    this.sync();
  }

  connect(): void {
    super.connect();
    this.input.connect(this.compressor);
    this.input.connect(this.inputMeter);
    this.compressor.connect(this.gain);
    this.gain.connect(this.output);
    this.hasConnected = true;
  }

  disconnect(): void {
    super.disconnect();
    this.compressor.disconnect();
    this.hasConnected = false;
  }

  dispose() {
    this.disconnect();
    this.compressor.dispose();
    this.gain.dispose();
    this.inputMeter.dispose();
    this.hasConnected = false;
  }
}
