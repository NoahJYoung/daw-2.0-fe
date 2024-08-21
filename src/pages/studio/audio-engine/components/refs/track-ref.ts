import { customRef, findParent, detach } from "mobx-keystone";
import { Mixer } from "../mixer";
import { Track } from "../track";

export const trackRef = customRef<Track>("AudioEngine/TrackRef", {
  resolve(ref) {
    const mixer = findParent<Mixer>(ref, (n) => n instanceof Mixer);
    if (!mixer) return undefined;
    return mixer.tracks.find((track) => track.id === ref.id);
  },

  onResolvedValueChange(ref, newTrack, oldTrack) {
    if (oldTrack && !newTrack) {
      detach(ref);
    }
  },
});
