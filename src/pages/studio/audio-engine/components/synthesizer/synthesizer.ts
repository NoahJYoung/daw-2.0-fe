import { model, ExtendedModel, prop, idProp } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { Oscillator } from "../oscillator";
import * as Tone from "tone";
import { computed, observable, action } from "mobx";

@model("AudioEngine/Synthesizer")
export class Synthesizer extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  volume: prop(0).withSetter(),
  triangle: prop<Oscillator>(() => new Oscillator({ type: "triangle" })),
  square: prop<Oscillator>(() => new Oscillator({ type: "square" })),
  sine: prop<Oscillator>(() => new Oscillator({ type: "sine" })),
  sawtooth: prop<Oscillator>(() => new Oscillator({ type: "sawtooth" })),
}) {
  output = new Tone.Channel();

  @observable activeNotes = new Map<string, boolean>();

  @observable _activeOscillators: Oscillator[] = [];

  init() {
    this.triangle.connect(this.output);
    this.square.connect(this.output);
    this.sine.connect(this.output);
    this.sawtooth.connect(this.output);

    this.updateActiveOscillators();

    this.sync();
  }

  @action
  updateActiveOscillators() {
    this._activeOscillators = this.oscillators.filter((osc) => !osc.mute);
  }

  sync() {
    this.output.set({ volume: this.volume });

    this.updateActiveOscillators();
  }

  @action
  triggerAttack(note: string, time: Tone.Unit.Time, velocity: number) {
    if (this.activeNotes.get(note)) return;

    this.activeNotes.set(note, true);

    this._activeOscillators.forEach((osc) =>
      osc.triggerAttack(note, time, velocity)
    );
  }

  @action
  triggerRelease(note: string, time: Tone.Unit.Time) {
    if (!this.activeNotes.get(note)) return;

    this.activeNotes.set(note, false);

    this._activeOscillators.forEach((osc) => osc.triggerRelease(note, time));
  }

  triggerAttackRelease(
    note: string,
    duration: Tone.Unit.Time,
    time: Tone.Unit.Time,
    velocity: number
  ) {
    this._activeOscillators.forEach((osc) => {
      osc.triggerAttackRelease(note, duration, time, velocity);
    });
  }

  @action
  releaseAll(time: Tone.Unit.Time) {
    this.activeNotes.clear();

    this._activeOscillators.forEach((osc) => osc.releaseAll(time));
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

  dispose() {
    this.releaseAll(Tone.now());

    this.activeNotes.clear();

    this.triangle.dispose();
    this.square.dispose();
    this.sine.dispose();
    this.sawtooth.dispose();

    this._activeOscillators = [];

    this.output.dispose();
  }
}
