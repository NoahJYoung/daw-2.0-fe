import { customRef, detach, getRoot } from "mobx-keystone";
import { Track } from "../track";
import { AudioEngine } from "../../audio-engine";

export const trackRef = customRef<Track>("AudioEngine/TrackRef", {
  resolve(ref) {
    const { mixer } = getRoot<AudioEngine>(this);

    return mixer?.tracks.find((track) => {
      return track.id === ref.id;
    });
  },

  onResolvedValueChange(ref, newTrack, oldTrack) {
    if (oldTrack && !newTrack) {
      detach(ref);
    }
  },
});
