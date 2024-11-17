import { model, prop, ExtendedModel, modelAction, Ref } from "mobx-keystone";
import { computed } from "mobx";
import { Track } from "../track";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { clipRef, trackRef } from "../refs";
import { Master } from "../master";
import { PanelMode } from "./types";
import { Clip } from "../types";

@model("AudioEngine/Mixer")
export class Mixer extends ExtendedModel(BaseAudioNodeWrapper, {
  tracks: prop<Track[]>(() => []),
  selectedRefs: prop<Ref<Track>[]>(() => []),
  master: prop<Master>(() => new Master({})),
  topPanelHeight: prop<number>(window.innerHeight - 156),
  featuredClipRef: prop<Ref<Clip> | null>(null).withSetter(),
  featuredTrackRef: prop<Ref<Track> | null>(null).withSetter(),
  panelMode: prop<PanelMode>("MIXER").withSetter(),
}) {
  init() {
    this.setVolumeOnUnsoloedTracks();
    this.sync();
  }

  sync() {
    this.tracks.forEach((track) => track.channel.toDestination());
  }

  @modelAction
  createTrack = () => {
    const track = new Track({});
    this.tracks.push(track);
    this.refreshTopPanelHeight();
    track.channel.toDestination();
  };

  @modelAction
  removeTrack(track: Track) {
    const index = this.tracks.indexOf(track);
    if (index >= 0) {
      this.tracks.splice(index, 1);
    }
    track.dispose();
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
    if (!this.tracks.includes(track)) throw new Error("unknown todo");

    const trackRefIndex = this.selectedRefs.findIndex(
      (todoRef) => todoRef.maybeCurrent === track
    );

    if (trackRefIndex >= 0) {
      this.selectedRefs.splice(trackRefIndex, 1);
    }
  }

  @modelAction
  selectFeaturedTrack(track: Track) {
    if (track && !this.tracks.includes(track)) throw new Error("unknown track");

    this.featuredTrackRef = track ? trackRef(track) : null;
    if (this.featuredClip && this.featuredClip.trackId !== track?.id) {
      this.unselectFeaturedClip();
    }
  }

  @modelAction
  unselectFeaturedTrack() {
    this.featuredTrackRef = null;
  }

  @modelAction
  selectFeaturedClip(clip: Clip) {
    if (clip && !this.tracks.some((track) => track.clips.includes(clip)))
      throw new Error("unknown track");

    this.featuredClipRef = clip ? clipRef(clip) : null;
  }

  @modelAction
  unselectFeaturedClip() {
    this.featuredClipRef = null;
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

  @computed
  get featuredClip() {
    return this.featuredClipRef ? this.featuredClipRef.current : undefined;
  }

  @computed
  get featuredTrack() {
    return this.featuredTrackRef ? this.featuredTrackRef.current : undefined;
  }

  @modelAction
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

    console.log(reducedClipEnds);

    return reducedClipEnds.reduce((maxEnd, end) => {
      return end > maxEnd ? end : maxEnd;
    }, -Infinity);
  }
}
