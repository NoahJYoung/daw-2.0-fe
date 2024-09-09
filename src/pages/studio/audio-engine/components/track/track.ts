import {
  ExtendedModel,
  getRoot,
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
import {
  INITIAL_LANE_HEIGHT,
  MAX_LANE_HEIGHT,
  MIN_LANE_HEIGHT,
} from "../../constants";

@model("AudioEngine/Mixer/Track")
export class Track extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  name: prop<string>("New Track").withSetter(),
  clips: prop<Clip[]>(() => []),
  rgb: prop<[number, number, number]>(() => [
    Math.floor(Math.random() * 251),
    Math.floor(Math.random() * 251),
    Math.floor(Math.random() * 251),
  ]).withSetter(),
  active: prop(false).withSetter(),
  mute: prop(false).withSetter(),
  pan: prop(0).withSetter(),
  laneHeight: prop(INITIAL_LANE_HEIGHT),
  volume: prop(-12).withSetter(),
  selectedRefs: prop<Ref<Clip>[]>(() => []),
  input: prop<string | null>(null).withSetter(),
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

  @computed
  get color() {
    const [r, g, b] = this.rgb;
    return `rgb(${r}, ${g}, ${b})`;
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

  @modelAction
  setLaneHeight(newHeight: number) {
    if (newHeight > MAX_LANE_HEIGHT) {
      this.laneHeight = MAX_LANE_HEIGHT;
    } else if (newHeight < MIN_LANE_HEIGHT) {
      this.laneHeight = MIN_LANE_HEIGHT;
    } else {
      this.laneHeight = newHeight;
    }
  }

  resetLaneHeight() {
    this.setLaneHeight(INITIAL_LANE_HEIGHT);
  }

  play = () => {
    const { state } = getRoot(this);
    if (this.active && state === "recording") {
      return;
    }

    const transport = Tone.getTransport();
    const transportInSamples = Tone.Time(transport.seconds, "s").toSamples();
    this.clips.forEach((clip) => {
      const seekTime = transportInSamples - clip.start;
      if (transportInSamples > clip.start && transportInSamples < clip.end) {
        clip.play(Tone.now(), seekTime);
      } else {
        clip.schedule();
      }
    });
  };
}
