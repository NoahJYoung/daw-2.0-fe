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
  filter = new Tone.Filter(this.frequency, this.type);

  sync() {
    const { frequency, gain, type, Q } = this;
    this.filter.set({ type });
    this.filter.frequency.linearRampTo(frequency, 0.05);
    this.filter.gain.linearRampTo(gain, 0.05);
    this.filter.Q.linearRampTo(Q, 0.05);
  }

  init() {
    this.sync();
  }

  connect(node: Tone.ToneAudioNode) {
    this.filter.connect(node);
    return node;
  }

  disconnect(node?: Tone.ToneAudioNode) {
    this.filter.disconnect(node);
  }
}
