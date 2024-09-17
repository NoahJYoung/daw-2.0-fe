import { ExtendedModel, idProp, model, prop } from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { PitchNameString } from "./types";

@model("AudioEngine/Mixer/Track/MidiClip/MidiEvent")
export class MidiEvent extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  note: prop<PitchNameString>(),
  on: prop<number>(),
  off: prop<number>(),
  velocity: prop<number>(65),
}) {
  getRefId() {
    return this.id;
  }

  @computed
  get length(): number {
    return this.off - this.on;
  }

  play() {}

  stop() {}

  schedule() {}

  split() {}

  dispose() {
    // TODO:
  }
}
