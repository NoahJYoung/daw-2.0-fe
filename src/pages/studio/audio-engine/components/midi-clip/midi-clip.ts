import { ExtendedModel, idProp, model, prop } from "mobx-keystone";
import { computed } from "mobx";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { Track } from "../track";
import * as Tone from "tone";

@model("AudioEngine/Mixer/Track/MidiClip")
export class MidiClip extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  track: prop<Track>(),
  audioBuffer: prop<Tone.ToneAudioBuffer>(),
  start: prop<number>().withSetter(),
  notes: prop<unknown[]>(() => []),
}) {
  readonly type = "midi";
  player = new Tone.Player(this.audioBuffer);

  getRefId() {
    return this.id;
  }

  @computed
  get length(): number {
    return this.audioBuffer.length;
  }

  @computed
  get end(): number {
    return this.start + this.length;
  }

  dispose() {
    // TODO:
  }
}
