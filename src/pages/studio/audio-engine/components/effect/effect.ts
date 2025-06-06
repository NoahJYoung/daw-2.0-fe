import { ExtendedModel, idProp, model, prop } from "mobx-keystone";

import * as Tone from "tone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { METER_SMOOTHING_VALUE } from "@/pages/studio/utils/constants";

interface EffectInterface {
  readonly name: string;
}

@model("AudioEngine/Effect")
export class Effect
  extends ExtendedModel(BaseAudioNodeWrapper, {
    id: idProp,
    mute: prop(false).withSetter(),
    inputVolume: prop(0).withSetter(),
    outputVolume: prop(0).withSetter(),
    dialogOpen: prop(true).withSetter(),
  })
  implements EffectInterface
{
  inputMeter = new Tone.Meter(METER_SMOOTHING_VALUE);
  outputMeter = new Tone.Meter(METER_SMOOTHING_VALUE);
  bypass = new Tone.Channel();
  input = new Tone.Channel();
  output = new Tone.Channel();

  get name(): string {
    throw new Error("'Effect' subclasses must implement the 'name' getter");
  }

  sync() {
    this.disconnect();
    this.connect();
    if (this.mute) {
      this.input.volume.value = -Infinity;
      this.bypass.volume.value = 0;
    } else {
      this.bypass.volume.value = -Infinity;
      this.input.volume.value = this.inputVolume;
    }
    this.output.volume.rampTo(this.outputVolume);
  }

  init() {
    this.input.connect(this.inputMeter);
    this.output.connect(this.outputMeter);
    this.sync();
  }

  connect() {
    this.input.connect(this.bypass);
    this.bypass.connect(this.output);
    this.output.connect(this.outputMeter);
  }

  disconnect() {
    this.bypass.disconnect();
    this.output.disconnect();
  }

  dispose() {
    throw new Error("'Effect' subclasses must implement the dispose method");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EffectConstructor = new (...args: any[]) => Effect;
