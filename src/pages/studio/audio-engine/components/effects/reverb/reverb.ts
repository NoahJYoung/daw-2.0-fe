import { ExtendedModel, model, prop } from "mobx-keystone";
import { Effect } from "../../effect/effect";
import { action, observable } from "mobx";
import * as Tone from "tone";
import { audioBufferCache } from "../../audio-buffer-cache";

@model("AudioEngine/Effects/Reverb")
export class Reverb extends ExtendedModel(Effect, {
  selectedReverb: prop<string | null>(null).withSetter(),
}) {
  convolver = new Tone.Convolver();
  private hasConnected = false;

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
    this.connect();
    if (this.selectedReverb) {
      if (!audioBufferCache.has(this.selectedReverb)) {
        throw new Error("Convolution file not in Audio Cache");
      }
      this.convolver.buffer = audioBufferCache.get(this.selectedReverb);
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
    this.input.connect(this.convolver);
    this.convolver.connect(this.output);
    this.hasConnected = true;
  }

  disconnect(): void {
    super.disconnect();
    this.convolver.disconnect();
  }
}
