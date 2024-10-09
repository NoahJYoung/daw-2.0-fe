import { ExtendedModel, idProp, model, prop } from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { PitchNameTuple } from "./types";

@model("AudioEngine/Mixer/Track/MidiClip/MidiNote")
export class MidiNote extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  note: prop<PitchNameTuple>(),
  on: prop<number>(),
  off: prop<number>(),
  velocity: prop<number>(65),
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
}
