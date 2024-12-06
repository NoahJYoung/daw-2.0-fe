import { ExtendedModel, model, prop } from "mobx-keystone";
import { Effect } from "../../effect/effect";
import { action, observable } from "mobx";
import * as Tone from "tone";

@model("AudioEngine/Effects/Reverb")
export class Reverb extends ExtendedModel(Effect, {
  url: prop<string | undefined>(undefined).withSetter(),
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
    if (this.url) {
      this.convolver.load(this.url);
      this.convolver.set({
        onload: () => {
          alert("LOADED");
          this.setLoading(false);
        },
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

  loadFile(url: string) {
    this.setLoading(true);
    this.setUrl(url);
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
