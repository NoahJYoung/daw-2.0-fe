import { model, ExtendedModel, idProp, prop, Ref } from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { Track } from "../track";
import { computed } from "mobx";
import * as Tone from "tone";

@model("AudioEngine/AuxSend")
export class AuxSend extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  fromRef: prop<Ref<Track>>().withSetter(),
  toRef: prop<Ref<Track>>().withSetter(),
  volume: prop(0).withSetter(),
  mute: prop(false).withSetter(),
}) {
  channel = new Tone.Channel();
  sync() {
    this.disconnect();
    this.connect();
    if (this.mute) {
      this.channel.volume.value = -Infinity;
    } else {
      this.channel.volume.linearRampTo(this.volume, 0.01);
    }
  }

  getRefId() {
    return this.id;
  }

  init() {
    this.sync();
  }

  connect() {
    try {
      this.from.channel.connect(this.channel);
      this.channel.connect(this.to.channel);
    } catch (error) {
      // TODO: Figure out how to handle connection error during offline render.
      // Current logic is functional, but error should be handled better
      console.error(error);
    }
  }

  disconnect() {
    this.channel.disconnect();
  }

  @computed
  get from() {
    return this.fromRef.current;
  }

  @computed
  get to() {
    return this.toRef.current;
  }
}
