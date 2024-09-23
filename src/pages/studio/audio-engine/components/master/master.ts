import { ExtendedModel, model, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import * as Tone from "tone";
import { METER_SMOOTHING_VALUE } from "@/pages/studio/utils/constants";

@model("AudioEngine/Mixer/Master")
export class Master extends ExtendedModel(BaseAudioNodeWrapper, {
  mute: prop(false).withSetter(),
  volume: prop(0).withSetter(),
}) {
  meterL = new Tone.Meter(METER_SMOOTHING_VALUE);
  meterR = new Tone.Meter(METER_SMOOTHING_VALUE);
  splitter = new Tone.Split();
  output = Tone.getDestination();

  sync() {
    const { volume, mute } = this;
    Tone.getDestination().set({ mute });
    Tone.getDestination().volume.linearRampTo(volume, 0.01);
  }

  init() {
    this.output.connect(this.splitter);
    this.splitter.connect(this.meterL, 0);
    this.splitter.connect(this.meterR, 1);
  }
}
