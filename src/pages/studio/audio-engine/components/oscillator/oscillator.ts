import { model, ExtendedModel, prop, idProp } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import * as Tone from "tone";
import { METER_SMOOTHING_VALUE } from "@/pages/studio/utils/constants";
import { action, reaction } from "mobx";

export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

@model("AudioEngine/Oscillator")
export class Oscillator extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  type: prop<OscillatorType>(),
  volume: prop(0).withSetter(),
  attack: prop(0.005).withSetter(),
  sustain: prop(0.3).withSetter(),
  decay: prop(0.1).withSetter(),
  release: prop(1).withSetter(),
  mute: prop(false).withSetter(),
}) {
  synth = new Tone.PolySynth(Tone.Synth).set({
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

  private _lastEnvelopeParams = {
    attack: this.attack,
    release: this.release,
    sustain: this.sustain,
    decay: this.decay,
  };

  private _velocityCache = new Map<number, number>();

  private _activeNotes = new Set<string>();

  private _volumeRampTimeout: number | null = null;

  private _disposers: (() => void)[] = [];

  init() {
    this.synth.connect(this.channel);

    this.channel.connect(this.meter);

    this._disposers.push(
      reaction(
        () => this.mute,
        (muted) => {
          this.channel.mute = muted;
        },
        { fireImmediately: true }
      )
    );

    this._disposers.push(
      reaction(
        () => this.volume,
        (volume) => {
          if (this._volumeRampTimeout) {
            window.clearTimeout(this._volumeRampTimeout);
          }

          this._volumeRampTimeout = window.setTimeout(() => {
            this.synth.volume.linearRampTo(volume, 0.1);
            this._volumeRampTimeout = null;
          }, 50);
        },
        { fireImmediately: true }
      )
    );

    this.sync();
  }

  @action
  sync() {
    const newEnvParams = {
      attack: this.attack,
      release: this.release,
      sustain: this.sustain,
      decay: this.decay,
    };

    let envelopeChanged = false;
    for (const key in newEnvParams) {
      if (
        this._lastEnvelopeParams[
          key as keyof typeof this._lastEnvelopeParams
        ] !== newEnvParams[key as keyof typeof newEnvParams]
      ) {
        envelopeChanged = true;
        break;
      }
    }

    if (envelopeChanged) {
      this.synth.set({
        envelope: newEnvParams,
      });

      this._lastEnvelopeParams = { ...newEnvParams };
    }
  }

  normalizeVelocity(velocity: number): number {
    if (!this._velocityCache.has(velocity)) {
      this._velocityCache.set(velocity, velocity / 127);
    }
    return this._velocityCache.get(velocity)!;
  }

  @action
  triggerAttack(note: string, time: Tone.Unit.Time, velocity: number) {
    if (this.mute) return;

    this._activeNotes.add(note);

    const normalizedVelocity = this.normalizeVelocity(velocity);
    this.synth.triggerAttack(note, time, normalizedVelocity);
  }

  @action
  triggerRelease(note: string, time: Tone.Unit.Time) {
    if (!this._activeNotes.has(note)) return;

    this._activeNotes.delete(note);

    this.synth.triggerRelease(note, time);
  }

  @action
  triggerAttackRelease(
    note: string,
    duration: Tone.Unit.Time,
    time: Tone.Unit.Time,
    velocity: number
  ) {
    if (this.mute) return;

    const normalizedVelocity = this.normalizeVelocity(velocity);
    this.synth.triggerAttackRelease(note, duration, time, normalizedVelocity);
  }

  @action
  releaseAll(time: Tone.Unit.Time) {
    this._activeNotes.clear();
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

  dispose() {
    this.releaseAll(Tone.now());

    if (this._volumeRampTimeout) {
      window.clearTimeout(this._volumeRampTimeout);
      this._volumeRampTimeout = null;
    }

    this._disposers.forEach((dispose) => dispose());
    this._disposers = [];

    this.synth.dispose();
    this.channel.dispose();
    this.meter.dispose();

    this._velocityCache.clear();
    this._activeNotes.clear();
  }
}
