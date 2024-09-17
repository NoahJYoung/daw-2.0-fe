import { model, prop, ExtendedModel, modelAction, Ref } from "mobx-keystone";
import { computed } from "mobx";
import { Track } from "../track";
import { BaseAudioNodeWrapper } from "../../base-audio-node-wrapper";
import { trackRef } from "../refs";

@model("AudioEngine/Mixer")
export class Mixer extends ExtendedModel(BaseAudioNodeWrapper, {
  tracks: prop<Track[]>(() => []),
  selectedRefs: prop<Ref<Track>[]>(() => []),
  topPanelHeight: prop<number>(window.innerHeight - 156),
}) {
  @modelAction
  createTrack = () => {
    const track = new Track({});
    this.tracks.push(track);
    this.refreshTopPanelHeight();
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

  @modelAction
  refreshTopPanelHeight() {
    const min = window.innerHeight - 156;
    this.topPanelHeight =
      this.combinedLaneHeights > min ? this.combinedLaneHeights : min;
  }

  getActiveTracks() {
    return this.tracks.filter((track) => track.active);
  }
}
