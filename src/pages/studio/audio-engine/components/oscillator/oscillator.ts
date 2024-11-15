import { model, ExtendedModel, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import * as Tone from "tone";
import { METER_SMOOTHING_VALUE } from "@/pages/studio/utils/constants";

export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

@model("AudioEngine/Oscillator")
export class Oscillator extends ExtendedModel(BaseAudioNodeWrapper, {
  type: prop<OscillatorType>(),
  volume: prop(0).withSetter(),
  attack: prop(0.005).withSetter(),
  sustain: prop(0.3).withSetter(),
  decay: prop(0.1).withSetter(),
  release: prop(1).withSetter(),
  mute: prop(false).withSetter(),
}) {
  private synth = new Tone.PolySynth(Tone.Synth).set({
    oscillator: { type: this.type },
    envelope: {
      attack: this.attack,
      release: this.release,
      sustain: this.sustain,
      decay: this.decay,
    },
  });

  channel = new Tone.Channel();

  meter = new Tone.Meter(METER_SMOOTHING_VALUE);

  init() {
    this.synth.connect(this.channel.connect(this.meter));
    this.sync();
  }

  sync() {
    this.synth.volume.linearRampTo(this.volume, 0.1);
    const { attack, release, sustain, decay } = this;

    this.synth.set({
      envelope: {
        attack,
        release,
        sustain,
        decay,
      },
    });

    this.channel.set({ mute: this.mute });
  }

  normalizeVelocity(velocity: number) {
    return velocity / 127;
  }

  triggerAttack(note: string, time: Tone.Unit.Time, velocity: number) {
    this.synth.triggerAttack(note, time, this.normalizeVelocity(velocity));
  }

  triggerRelease(note: string, time: Tone.Unit.Time) {
    this.synth.triggerRelease(note, time);
  }

  triggerAttackRelease(
    note: string,
    duration: Tone.Unit.Time,
    time: Tone.Unit.Time,
    velocity: number
  ) {
    this.synth.triggerAttackRelease(
      note,
      duration,
      time,
      this.normalizeVelocity(velocity)
    );
  }

  releaseAll(time: Tone.Unit.Time) {
    this.synth.releaseAll(time);
  }

  randomize() {
    const newAttack = this.getRandomFloat(0, 2, 0.005);
    const newRelease = this.getRandomFloat(0, 2, 0.005);
    const newDecay = this.getRandomFloat(0, 2, 0.005);
    const newSustain = this.getRandomFloat(0, 1, 0.005);
    const newVolume = this.getRandomFloat(-24, 2, 0.5);

    this.setAttack(newAttack);
    this.setRelease(newRelease);
    this.setDecay(newDecay);
    this.setSustain(newSustain);
    this.setVolume(newVolume);
  }

  getRandomFloat(min: number, max: number, step: number): number {
    const steps = Math.floor((max - min) / step);

    const randomStep = Math.floor(Math.random() * (steps + 1));

    return min + randomStep * step;
  }

  connect(node: Tone.ToneAudioNode) {
    this.channel.connect(node);
  }

  disconnect(node: Tone.ToneAudioNode) {
    this.channel.disconnect(node);
  }
}
