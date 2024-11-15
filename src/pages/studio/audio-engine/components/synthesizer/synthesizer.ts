import { model, ExtendedModel, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { Oscillator } from "../oscillator";
import * as Tone from "tone";
import { computed } from "mobx";

@model("AudioEngine/Synthesizer")
export class Synthesizer extends ExtendedModel(BaseAudioNodeWrapper, {
  volume: prop(0).withSetter(),
  triangle: prop<Oscillator>(() => new Oscillator({ type: "triangle" })),
  square: prop<Oscillator>(() => new Oscillator({ type: "square" })),
  sine: prop<Oscillator>(() => new Oscillator({ type: "sine" })),
  sawtooth: prop<Oscillator>(() => new Oscillator({ type: "sawtooth" })),
}) {
  output = new Tone.Channel();

  init() {
    this.triangle.connect(this.output);
    this.square.connect(this.output);
    this.sine.connect(this.output);
    this.sawtooth.connect(this.output);

    this.sync();
  }

  sync() {
    this.output.set({ volume: this.volume });
  }

  triggerAttack(note: string, time: Tone.Unit.Time, velocity: number) {
    this.oscillators.forEach((osc) => osc.triggerAttack(note, time, velocity));
  }

  triggerRelease(note: string, time: Tone.Unit.Time) {
    this.oscillators.forEach((osc) => osc.triggerRelease(note, time));
  }

  triggerAttackRelease(
    note: string,
    duration: Tone.Unit.Time,
    time: Tone.Unit.Time,
    velocity: number
  ) {
    this.oscillators.forEach((osc) =>
      osc.triggerAttackRelease(note, duration, time, velocity)
    );
  }

  releaseAll(time: Tone.Unit.Time) {
    this.oscillators.forEach((osc) => osc.releaseAll(time));
  }

  connect(node: Tone.ToneAudioNode) {
    this.output.connect(node);
  }

  disconnect(node: Tone.ToneAudioNode) {
    this.output.disconnect(node);
  }

  randomize() {
    this.oscillators.forEach((osc) => osc.randomize());
  }

  @computed
  get oscillators() {
    return [this.triangle, this.square, this.sine, this.sawtooth];
  }
}
