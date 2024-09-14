import { makeAutoObservable } from "mobx";
import { AudioClip } from "../audio-clip";
import { MidiClip } from "../midi-clip";
import { Track } from "../track";
import { Clip } from "../types";

type ClipboardItem = Clip | Track;

export class Clipboard {
  private clips: Clip[] = [];
  private tracks: Track[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  copy(items: ClipboardItem[]) {
    const trackItems = [...items].filter((item) => item instanceof Track);
    const clipItems = [...items].filter(
      (item) => item instanceof AudioClip || item instanceof MidiClip
    );

    this.tracks = trackItems;
    this.clips = clipItems;
  }

  getClips() {
    return this.clips;
  }

  getTracks() {
    return this.tracks;
  }

  getAll() {
    return { clips: this.clips, tracks: this.tracks };
  }
}
