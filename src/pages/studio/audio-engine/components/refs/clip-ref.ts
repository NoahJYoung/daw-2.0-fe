import { customRef, findParent, detach } from "mobx-keystone";
import { Track } from "../track";
import { Clip } from "../types";
import { Mixer } from "../mixer";

export const clipRef = customRef<Clip>("AudioEngine/ClipRef", {
  resolve(ref) {
    const parent = findParent<Track | Mixer>(
      ref,
      (n) => n instanceof Track || n instanceof Mixer
    );
    if (!parent) return undefined;
    if (parent instanceof Track) {
      return parent.clips.find((clip) => clip.id === ref.id);
    }
    if (parent instanceof Mixer) {
      // return parent.clips.find((clip) => clip.id === ref.id);
      return parent.tracks
        .find((track) => track.clips.find((clip) => clip.id === ref.id))
        ?.clips.find((clip) => clip.id === ref.id);
    }
  },

  onResolvedValueChange(ref, newClip, oldClip) {
    if (oldClip && !newClip) {
      detach(ref);
    }
  },
});
