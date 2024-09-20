import { ExtendedModel, model, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import * as Tone from "tone";

const METER_SMOOTHING_VALUE = 0.8;

@model("AudioEngine/Mixer/Master")
export class Master extends ExtendedModel(BaseAudioNodeWrapper, {
  mute: prop(false).withSetter(),
  volume: prop(0).withSetter(),
}) {
  meter = new Tone.Meter(METER_SMOOTHING_VALUE);
  output = Tone.getDestination();

  sync() {
    const { volume, mute } = this;
    Tone.getDestination().set({ mute });
    Tone.getDestination().volume.linearRampTo(volume, 0.01);
  }

  init() {
    this.output.connect(this.meter);
  }
}
