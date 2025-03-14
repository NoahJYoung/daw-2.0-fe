import { ExtendedModel, model, prop } from "mobx-keystone";
import { Effect } from "../../effect/effect";
import * as Tone from "tone";

@model("AudioEngine/Effects/Compressor")
export class Compressor extends ExtendedModel(Effect, {
  attack: prop<number>(0).withSetter(),
  release: prop<number>(0).withSetter(),
  threshold: prop<number>(0).withSetter(),
  ratio: prop<number>(4).withSetter(),
  knee: prop<number>(0).withSetter(),
  makeupGain: prop<number>(2).withSetter(),
}) {
  private compressor = new Tone.Compressor();
  private gain = new Tone.Gain(this.makeupGain);
  private hasConnected = false;

  get name() {
    return "Compressor";
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
    this.compressor.connect(this.gain);
    this.gain.connect(this.output);
    this.hasConnected = true;
  }

  disconnect(): void {
    super.disconnect();
    this.compressor.disconnect();
    this.hasConnected = false;
  }
}
