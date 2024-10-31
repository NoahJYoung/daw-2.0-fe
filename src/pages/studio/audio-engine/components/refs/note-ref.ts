import { customRef, findParent, detach } from "mobx-keystone";
import { MidiClip } from "../midi-clip";
import { MidiNote } from "../midi-note";

export const noteRef = customRef<MidiNote>("AudioEngine/NoteRef", {
  resolve(ref) {
    const clip = findParent<MidiClip>(ref, (n) => n instanceof MidiClip);
    if (!clip) return undefined;
    return clip.events.find((event) => event.id === ref.id);
  },

  onResolvedValueChange(ref, newTrack, oldTrack) {
    if (oldTrack && !newTrack) {
      detach(ref);
    }
  },
});
