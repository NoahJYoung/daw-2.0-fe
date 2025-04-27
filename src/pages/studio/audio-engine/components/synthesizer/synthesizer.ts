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

  // Track active notes to prevent duplicate triggers
  @observable activeNotes = new Map<string, boolean>();

  // Cache for active oscillators to avoid filtering in the hot path
  @observable _activeOscillators: Oscillator[] = [];

  init() {
    // Connect all oscillators at initialization time
    this.triangle.connect(this.output);
    this.square.connect(this.output);
    this.sine.connect(this.output);
    this.sawtooth.connect(this.output);

    // Update the active oscillators cache
    this.updateActiveOscillators();

    this.sync();
  }

  @action
  updateActiveOscillators() {
    this._activeOscillators = this.oscillators.filter((osc) => !osc.mute);
  }

  sync() {
    this.output.set({ volume: this.volume });

    // When oscillator mute status changes, update the active oscillators cache
    this.updateActiveOscillators();
  }

  @action
  triggerAttack(note: string, time: Tone.Unit.Time, velocity: number) {
    // Skip if we're already playing this note (prevents duplicate triggers)
    if (this.activeNotes.get(note)) return;

    // Mark note as active
    this.activeNotes.set(note, true);

    // Only trigger active oscillators
    this._activeOscillators.forEach((osc) =>
      osc.triggerAttack(note, time, velocity)
    );
  }

  @action
  triggerRelease(note: string, time: Tone.Unit.Time) {
    // Skip if note isn't active
    if (!this.activeNotes.get(note)) return;

    // Mark note as inactive
    this.activeNotes.set(note, false);

    // Only release on active oscillators
    this._activeOscillators.forEach((osc) => osc.triggerRelease(note, time));
  }

  triggerAttackRelease(
    note: string,
    duration: Tone.Unit.Time,
    time: Tone.Unit.Time,
    velocity: number
  ) {
    // Only use active oscillators
    this._activeOscillators.forEach((osc) => {
      osc.triggerAttackRelease(note, duration, time, velocity);
    });
  }

  @action
  releaseAll(time: Tone.Unit.Time) {
    // Clear active notes tracking
    this.activeNotes.clear();

    // Only release active oscillators
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
}
