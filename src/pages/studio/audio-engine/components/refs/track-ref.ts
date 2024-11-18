import { customRef, detach } from "mobx-keystone";
import { Track } from "../track";
import { mixerCtx } from "../../audio-engine";

export const trackRef = customRef<Track>("AudioEngine/TrackRef", {
  resolve(ref) {
    const mixer = mixerCtx.getDefault();

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
