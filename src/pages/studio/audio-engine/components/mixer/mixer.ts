import {
  model,
  prop,
  ExtendedModel,
  modelAction,
  Ref,
  idProp,
  getRoot,
} from "mobx-keystone";
import { action, computed, observable } from "mobx";
import { Track } from "../track";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { trackRef } from "../refs";
import { Master } from "../master";
import { PanelMode } from "./types";
import { Clip } from "../types";
import { AudioEngine } from "../../audio-engine";

@model("AudioEngine/Mixer")
export class Mixer extends ExtendedModel(BaseAudioNodeWrapper, {
  id: idProp,
  tracks: prop<Track[]>(() => []),
  selectedRefs: prop<Ref<Track>[]>(() => []),
  master: prop<Master>(() => new Master({})),
}) {
  @observable
  featuredTrackId: string | undefined = undefined;

  @observable
  featuredClipId: string | undefined = undefined;

  @observable
  panelMode: PanelMode = "MIXER";

  @observable
  topPanelHeight: number = window.innerHeight - 156;

  @action
  setPanelMode(mode: PanelMode) {
    this.panelMode = mode;
  }

  @action
  setTopPanelHeight(height: number) {
    this.topPanelHeight = height;
  }

  @computed
  get featuredTrack() {
    if (this.featuredTrackId) {
      return this.tracks.find(({ id }) => id === this.featuredTrackId);
    }
  }

  @computed
  get featuredClip() {
    if (this.featuredClipId) {
      return this.featuredTrack?.clips.find(
        ({ id }) => id === this.featuredClipId
      );
    }
  }

  init() {
    this.setVolumeOnUnsoloedTracks();
    this.sync();
  }

  getRefId() {
    return this.id;
  }

  sync() {
    this.tracks.forEach((track) => {
      track.output.toDestination();
    });
  }

  @modelAction
  createTrack = () => {
    const track = new Track({});
    this.tracks.push(track);
    this.refreshTopPanelHeight();
    track.output.toDestination();
  };

  @modelAction
  removeTrack(track: Track) {
    this.checkAndRemoveDeletedTrackFromAuxSendManager(track);

    const index = this.tracks.indexOf(track);
    if (index >= 0) {
      this.tracks.splice(index, 1);
    }
    track.dispose();
  }

  checkAndRemoveDeletedTrackFromAuxSendManager(track: Track) {
    const { auxSendManager } = getRoot<AudioEngine>(this);
    const sendsToRemove = auxSendManager.getSendsByTrack(track);
    const receivesToRemove = auxSendManager.getReceivesByTrack(track);

    [...sendsToRemove, ...receivesToRemove].forEach((auxSend) =>
      auxSendManager.removeAuxSend(auxSend.id)
    );
  }

  @modelAction
  selectTrack(track: Track) {
    if (!this.tracks.includes(track)) throw new Error("unknown track");

    if (!this.selectedTracks.includes(track)) {
      this.selectedRefs.push(trackRef(track));
    }
  }

  @modelAction
  unselectTrack(track: Track) {
    if (!this.tracks.includes(track)) throw new Error("unknown track");

    const trackRefIndex = this.selectedRefs.findIndex(
      (todoRef) => todoRef.maybeCurrent === track
    );

    if (trackRefIndex >= 0) {
      this.selectedRefs.splice(trackRefIndex, 1);
    }
  }

  @action
  selectFeaturedTrack(track: Track) {
    if (track && !this.tracks.includes(track)) throw new Error("unknown track");

    this.featuredTrackId = track.id;

    if (this.featuredClip && this.featuredClip.trackId !== track?.id) {
      this.unselectFeaturedClip();
    }
  }

  @modelAction
  unselectFeaturedTrack() {
    this.featuredTrackId = undefined;
  }

  @action
  selectFeaturedClip(clip: Clip) {
    // TODO: Remove this when audio clip zoom view is implemented
    if (clip.type === "audio") return;

    if (clip && !this.tracks.some((track) => track.clips.includes(clip)))
      throw new Error("unknown clip");

    this.featuredTrackId = clip.trackId;
    this.featuredClipId = clip.id;
  }

  @action
  unselectFeaturedClip() {
    this.featuredClipId = undefined;
  }

  @modelAction
  unselectAllTracks() {
    this.selectedRefs = [];
  }

  unselectAllClips() {
    this.tracks.forEach((track) => track.unselectAllClips());
  }

  getCombinedLaneHeightsAtIndex(index: number) {
    return [...this.tracks]
      .slice(0, index)
      .reduce((total, current) => (total += current.laneHeight), 0);
  }

  getTrackAtYPosition(yPosition: number): Track | null {
    let currentHeight = 0;

    for (let i = 0; i < this.tracks.length; i++) {
      const track = this.tracks[i];
      const trackHeight = track.laneHeight;

      if (yPosition < currentHeight + trackHeight) {
        return track;
      }

      currentHeight += trackHeight;
    }

    return null;
  }

  @computed
  get selectedTracks() {
    return this.selectedRefs.map((r) => r.current);
  }

  @computed
  get selectedClips() {
    return this.tracks.map((track) => track.selectedClips).flat();
  }

  @computed
  get combinedLaneHeights() {
    return this.tracks.reduce(
      (total, current) => (total += current.laneHeight),
      0
    );
  }

  @action
  refreshTopPanelHeight() {
    const min = window.innerHeight - 156;
    this.topPanelHeight =
      this.combinedLaneHeights > min ? this.combinedLaneHeights : min;
  }

  getActiveTracks() {
    return this.tracks.filter((track) => track.active);
  }

  setVolumeOnUnsoloedTracks() {
    if (this.tracks.some((track) => track.solo)) {
      this.tracks.forEach((track) => {
        if (!track.solo) {
          track.channel.volume.value = -Infinity;
          return;
        }
      });
    } else {
      this.tracks.forEach(
        (track) => (track.channel.volume.value = track.volume)
      );
    }
  }

  getLastClipEndSamples() {
    const reducedClipEnds = this.tracks.map((track) => track.findLargestEnd());
    if (reducedClipEnds.length === 0) {
      return 0;
    }

    return reducedClipEnds.reduce((maxEnd, end) => {
      return end > maxEnd ? end : maxEnd;
    }, -Infinity);
  }
}
