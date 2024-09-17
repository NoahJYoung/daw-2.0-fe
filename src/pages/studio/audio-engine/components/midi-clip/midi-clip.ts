import { ExtendedModel, idProp, model, prop } from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { MidiEvent } from "../midi-event";

@model("AudioEngine/Mixer/Track/MidiClip")
export class MidiClip extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  trackId: prop<string>(),
  start: prop<number>().withSetter(),
  events: prop<MidiEvent[]>(() => []),
  loopSamples: prop<number>(0),
  fadeInSamples: prop<number>(0).withSetter(),
  fadeOutSamples: prop<number>(0).withSetter(),
}) {
  readonly type = "midi";

  getRefId() {
    return this.id;
  }

  @computed
  get length(): number {
    return 0;
  }

  @computed
  get end(): number {
    return this.start + this.length;
  }

  setLoopSamples() {}

  play() {}

  stop() {}

  schedule() {}

  split() {}

  dispose() {
    // TODO:
  }
}
