import {
  ExtendedModel,
  idProp,
  model,
  modelAction,
  prop,
  Ref,
} from "mobx-keystone";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { AudioClip } from "../audio-clip";
import * as Tone from "tone";
import { computed } from "mobx";
import { clipRef } from "../refs";
import { Clip } from "../types";

@model("AudioEngine/Mixer/Track")
export class Track extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  name: prop<string>("New Track").withSetter(),
  clips: prop<Clip[]>(() => []),
  rgbColor: prop<string>("rgb(120, 120, 120)").withSetter(),
  active: prop(false).withSetter(),
  mute: prop(false).withSetter(),
  pan: prop(0).withSetter(),
  volume: prop(-12).withSetter(),
  selectedRefs: prop<Ref<Clip>[]>(() => []),
}) {
  channel = new Tone.Channel();

  sync() {
    const { volume, pan, mute } = this;
    this.channel.set({ volume, pan, mute });
  }

  getRefId() {
    return this.id;
  }

  @modelAction
  createAudioClip = (clip: AudioClip) => {
    this.clips.push(clip);
  };

  @modelAction
  deleteClip(audioClip: Clip) {
    const index = this.clips.indexOf(audioClip);
    if (index >= 0) {
      this.clips.splice(index, 1);
    }
    audioClip.dispose();
  }

  @computed
  get selectedClips() {
    return this.selectedRefs.map((r) => r.current);
  }

  @modelAction
  selectClip(clip: Clip) {
    if (!this.clips.includes(clip)) throw new Error("unknown audioClip");

    if (!this.selectedClips.includes(clip)) {
      this.selectedRefs.push(clipRef(clip));
    }
  }

  @modelAction
  unselectClip(clip: Clip) {
    if (!this.clips.includes(clip)) throw new Error("unknown clip");

    const trackRefIndex = this.selectedRefs.findIndex(
      (clipRef) => clipRef.maybeCurrent === clip
    );

    if (trackRefIndex >= 0) {
      this.selectedRefs.splice(trackRefIndex, 1);
    }
  }

  selectAllClips() {
    this.clips.forEach((clip) => this.selectClip(clip));
  }

  unselectAllClips() {
    this.clips.forEach((clip) => this.unselectClip(clip));
  }

  @modelAction
  dispose() {
    this.channel.dispose();
    this.clips.forEach((clip) => clip.dispose());
    this.clips = [];
  }
}
