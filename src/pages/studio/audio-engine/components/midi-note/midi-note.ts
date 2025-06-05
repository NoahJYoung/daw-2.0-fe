import { ExtendedModel, idProp, model, modelAction, prop } from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { PitchNameTuple } from "./types";
import * as Tone from "tone";
@model("AudioEngine/Mixer/Track/MidiClip/MidiNote")
export class MidiNote extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  note: prop<PitchNameTuple>().withSetter(),
  on: prop<number>(),
  off: prop<number>(),
  velocity: prop<number>(65).withSetter(),
}) {
  startEventId: number | null = null;
  stopEventId: number | null = null;

  ticksOn = Tone.Time(this.on, "samples").toTicks();
  ticksOff = Tone.Time(this.off, "samples").toTicks();

  getRefId() {
    return this.id;
  }

  protected sync(): void {
    this.ticksOn = Tone.Time(this.on, "samples").toTicks();
    this.ticksOff = Tone.Time(this.off, "samples").toTicks();
  }

  @modelAction
  setOn(newOn: number) {
    this.on = newOn;
    this.ticksOn = Tone.Time(newOn, "samples").toTicks();
  }

  @modelAction
  setOff(newOff: number) {
    this.off = newOff;
    this.ticksOff = Tone.Time(newOff, "samples").toTicks();
  }

  setOnOffFromTicks() {
    const currentTickOnTimeInSamples = Tone.Ticks(this.ticksOn).toSamples();
    const currentTickOffTimeInSamples = Tone.Ticks(this.ticksOff).toSamples();

    this.setOn(currentTickOnTimeInSamples);
    this.setOff(currentTickOffTimeInSamples);
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

  dispose() {
    const transport = Tone.getTransport();

    if (this.startEventId !== null) {
      transport.clear(this.startEventId);
      this.startEventId = null;
    }

    if (this.stopEventId !== null) {
      transport.clear(this.stopEventId);
      this.stopEventId = null;
    }
  }
}
