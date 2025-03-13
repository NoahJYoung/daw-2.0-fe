import { ExtendedModel, model, prop } from "mobx-keystone";
import { Effect } from "../../effect/effect";
import { action, observable } from "mobx";
import * as Tone from "tone";

@model("AudioEngine/Effects/Reverb")
export class Reverb extends ExtendedModel(Effect, {
  wet: prop<number>(1).withSetter(),
  decay: prop<number>(2.5).withSetter(),
  preDelay: prop<number>(0.01).withSetter(),
}) {
  private reverb = new Tone.Reverb(this.decay);
  private hasConnected = false;
  private volumeCompensator = new Tone.Gain(
    Math.max(14 * this.wet - 1.5 * this.decay, 1)
  );

  @observable
  loading: boolean = false;

  get name() {
    return "Reverb";
  }

  sync() {
    super.sync();
    if (this.hasConnected) {
      this.disconnect();
    }
    const { wet, decay, preDelay } = this;
    this.reverb.set({ decay, preDelay });
    this.reverb.wet.linearRampTo(wet, 0.2);

    this.connect();
    if (this.mute) {
      this.volumeCompensator.set({ gain: 0 });
    } else {
      this.volumeCompensator.set({
        gain: Math.max(14 * this.wet - 1.5 * this.decay, 1),
      });
    }
  }

  init() {
    super.init();
    this.sync();
  }

  @action
  setLoading(state: boolean) {
    this.loading = state;
  }

  connect(): void {
    super.connect();
    this.input.connect(this.reverb);
    this.reverb.connect(this.volumeCompensator);
    this.volumeCompensator.connect(this.output);
    this.hasConnected = true;
  }

  disconnect(): void {
    super.disconnect();
    this.reverb.disconnect();
    this.hasConnected = false;
  }
}
