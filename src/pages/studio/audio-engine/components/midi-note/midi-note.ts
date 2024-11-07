import { ExtendedModel, idProp, model, prop } from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { PitchNameTuple } from "./types";
import * as Tone from "tone";
@model("AudioEngine/Mixer/Track/MidiClip/MidiNote")
export class MidiNote extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  note: prop<PitchNameTuple>().withSetter(),
  on: prop<number>().withSetter(),
  off: prop<number>().withSetter(),
  velocity: prop<number>(65).withSetter(),
}) {
  startEventId: number | null = null;
  stopEventId: number | null = null;

  getRefId() {
    return this.id;
  }

  @computed
  get length(): number {
    return this.off - this.on;
  }

  quantize(clipStart: number, subdivision: string, percentage: number) {
    this.quantizeOn(clipStart, subdivision, percentage);
    this.quantizeOff(clipStart, subdivision, percentage);
  }

  quantizeOn(clipStart: number, subdivision: string, percentage: number) {
    const globalPosition = clipStart + this.on;

    const quantizedGlobalPosition = Tone.Time(
      Tone.Time(globalPosition, "samples").quantize(subdivision, percentage),
      "s"
    ).toSamples();

    const quantizedOn = quantizedGlobalPosition - clipStart;

    const diff = this.on - quantizedOn;
    this.setOn(quantizedOn);
    this.setOff(this.off - diff);
  }

  quantizeOff(clipStart: number, subdivision: string, percentage: number) {
    const globalPosition = clipStart + this.off;
    const quantizedGlobalPosition = Tone.Time(
      Tone.Time(globalPosition, "samples").quantize(subdivision, percentage),
      "s"
    ).toSamples();

    const quantizedOff = quantizedGlobalPosition - clipStart;
    this.setOff(quantizedOff);
  }
}
