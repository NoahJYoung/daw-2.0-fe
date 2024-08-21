import { ExtendedModel, idProp, model, prop } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import * as Tone from "tone";
import { getAudioBufferFromNumberArray } from "../../helpers";
import { action, computed, observable } from "mobx";

@model("AudioEngine/Mixer/Track/AudioClip")
export class AudioClip extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  trackId: prop<string>(),
  start: prop<number>().withSetter(),
  loopSamples: prop<number>(0),
  audioData: prop<number[] | number[][]>(),
}) {
  player = new Tone.Player();

  @observable
  buffer: Tone.ToneAudioBuffer | null = null;

  getRefId() {
    return this.id;
  }

  init() {
    const audioBuffer = getAudioBufferFromNumberArray(this.audioData);
    const toneBuffer = new Tone.ToneAudioBuffer(audioBuffer);
    this.setBuffer(toneBuffer);
  }

  @computed
  get loaded(): boolean {
    return Boolean(this.buffer?.loaded && this.player?.loaded);
  }

  @computed
  get length(): number {
    return this.buffer?.length || 0;
  }

  @computed
  get end(): number {
    return this.start + this.length;
  }

  @action
  setBuffer(buffer: Tone.ToneAudioBuffer) {
    this.buffer = buffer;
  }

  sync() {}

  dispose() {
    // TODO:
  }
}
