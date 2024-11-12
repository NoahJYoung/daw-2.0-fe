import { model, ExtendedModel, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import * as Tone from "tone";
import { METER_SMOOTHING_VALUE } from "@/pages/studio/utils/constants";

export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

@model("AudioEngine/Oscillator")
export class Oscillator extends ExtendedModel(BaseAudioNodeWrapper, {
  type: prop<OscillatorType>(),
  volume: prop(-10).withSetter(),
  attack: prop(0).withSetter(),
  sustain: prop(0).withSetter(),
  decay: prop(0).withSetter(),
  release: prop(0).withSetter(),
}) {
  private synth = new Tone.PolySynth(Tone.Synth).set({
    oscillator: { type: this.type },
  });

  meter = new Tone.Meter(METER_SMOOTHING_VALUE);

  init() {
    this.synth.connect(this.meter);
  }

  sync() {
    this.synth.volume.linearRampTo(this.volume, 0.1);
  }

  triggerAttack(note: string, time: Tone.Unit.Time, velocity: number) {
    this.synth.triggerAttack(note, time);
  }

  triggerRelease(note: string, time: Tone.Unit.Time, velocity: number) {
    this.synth.triggerRelease(note, time);
  }

  triggerAttackRelease(
    note: string,
    duration: Tone.Unit.Time,
    time: Tone.Unit.Time,
    velocity: number
  ) {
    this.synth.triggerAttackRelease(note, duration, time);
  }

  releaseAll(time: Tone.Unit.Time) {
    this.synth.releaseAll(time);
  }

  connect(node: Tone.ToneAudioNode) {
    this.synth.connect(node);
  }

  disconnect(node: Tone.ToneAudioNode) {
    this.synth.disconnect(node);
  }
}
