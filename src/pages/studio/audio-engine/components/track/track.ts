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
import { action, computed, observable } from "mobx";
import { clipRef } from "../refs";
import { Clip } from "../types";
import {
  INITIAL_LANE_HEIGHT,
  MAX_LANE_HEIGHT,
  MIN_LANE_HEIGHT,
} from "../../constants";
import { METER_SMOOTHING_VALUE } from "@/pages/studio/utils/constants";

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
  volume: prop(0).withSetter(),
  selectedRefs: prop<Ref<Clip>[]>(() => []),
  input: prop<string | null>("mic").withSetter(),
}) {
  channel = new Tone.Channel();
  waveform = new Tone.Waveform();
  meterL = new Tone.Meter(METER_SMOOTHING_VALUE);
  meterR = new Tone.Meter(METER_SMOOTHING_VALUE);
  splitter = new Tone.Split();

  @observable
  isResizing: boolean = false;

  sync() {
    const { volume, pan, mute } = this;
    this.channel.set({ mute });
    this.channel.volume.linearRampTo(volume, 0.01);
    this.channel.pan.linearRampTo(pan, 0.01);
    this.connectClipsToOutput();
    this.clearAllEvents();
  }

  init() {
    this.channel.connect(this.splitter);
    this.splitter.connect(this.meterL, 0);
    this.splitter.connect(this.meterR, 1);
  }

  getRefId() {
    return this.id;
  }

  @modelAction
  createAudioClip = (clip: AudioClip) => {
    this.clips.push(clip);
    clip.player.connect(this.channel);
  };

  clearAllEvents() {
    this.clips.forEach((clip) => {
      if (clip.type === "audio") {
        clip.clearEvents();
      }
    });
  }

  connectClipsToOutput() {
    this.clips.forEach((clip) => {
      if (clip.type === "audio") {
        clip.player.connect(this.channel);
      }
    });
  }

  @modelAction
  deleteClip(clip: Clip) {
    const index = this.clips.indexOf(clip);
    if (index >= 0) {
      this.clips.splice(index, 1);
    }
    if (clip.type === "audio") {
      clip.player.disconnect(this.channel);
    }

    clip.dispose();
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

  @action
  setIsResizing(value: boolean) {
    this.isResizing = value;
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
    const { mixer } = getRoot(this);
    mixer.refreshTopPanelHeight();
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
      const seekTime = Tone.Time(
        transportInSamples - clip.start,
        "samples"
      ).toSeconds();
      if (
        transportInSamples > clip.start &&
        transportInSamples < clip.end + clip.loopSamples
      ) {
        clip.play(Tone.now(), seekTime);
      } else {
        clip.schedule();
      }
    });
  };

  stop = () => {
    this.clips.forEach((clip) => clip.stop(Tone.now()));
  };
}
