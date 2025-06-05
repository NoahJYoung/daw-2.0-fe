import { BaseAudioNodeWrapper } from "@/pages/studio/audio-engine/base-audio-node-wrapper";
import { ExtendedModel, idProp, model, prop } from "mobx-keystone";
import * as Tone from "tone";

@model("AudioEngine/GraphicEQ/Band")
export class Band extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  type: prop<BiquadFilterType>("peaking"),
  frequency: prop(1000).withSetter(),
  gain: prop(0).withSetter(),
  Q: prop(0.5).withSetter(),
}) {
  filter = new Tone.BiquadFilter(this.frequency, this.type);

  sync() {
    const { frequency, gain, Q } = this;
    this.filter.frequency.linearRampTo(frequency, 1);
    this.filter.gain.linearRampTo(gain, 0.25);
    this.filter.Q.linearRampTo(Q, 0.25);
  }

  init() {
    this.sync();
    this.filter.set({ type: this.type });
  }

  connect(node: Tone.ToneAudioNode) {
    this.filter.connect(node);
    return node;
  }

  disconnect(node?: Tone.ToneAudioNode) {
    this.filter.disconnect(node);
  }

  dispose() {
    this.filter.disconnect();
    this.filter.dispose();
  }
}
