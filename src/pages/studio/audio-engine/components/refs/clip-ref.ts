import { customRef, findParent, detach } from "mobx-keystone";
import { Track } from "../track";
import { Clip } from "../types";

export const clipRef = customRef<Clip>("AudioEngine/ClipRef", {
  resolve(ref) {
    const track = findParent<Track>(ref, (n) => n instanceof Track);
    if (!track) return undefined;
    return track.clips.find((clip) => clip.id === ref.id);
  },

  onResolvedValueChange(ref, newClip, oldClip) {
    if (oldClip && !newClip) {
      detach(ref);
    }
  },
});
